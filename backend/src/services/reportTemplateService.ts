// backend/src/services/reportTemplateService.ts
import { reportTemplateRepository } from '../repositories/reportTemplateRepository.js';
import { TemplateNotFoundError, TemplateTitleExistsError } from '../errors/reportTemplateErrors.js';
import { Prisma } from '@prisma/client';

const mapItemsToPrisma = (items: any[]) => {
  return items.map((item: any) => {
    const mapped: any = {
      label: item.label,
      description: item.description || null,
      placeholder: item.placeholder || null,
      helpText: item.helpText || null,
      required: !!item.required,
      maxLength: item.maxLength ?? null,
      type: item.type,
      width: item.width || 'FULL',
      key: item.key || null,
      order: item.order,
    };
    if (item.options !== undefined) mapped.options = item.options;
    if (item.defaultValue !== undefined) mapped.defaultValue = item.defaultValue;
    return mapped;
  });
};

// Helper para mapear secciones del frontend a Prisma
const mapSectionsToPrisma = (sections: any[]) => {
  return sections.map((section: any) => ({
    title: section.title,
    description: section.description || null,
    order: section.order,
    items: {
      create: mapItemsToPrisma(section.items || []),
    },
  }));
};

export const createTemplate = async (data: any) => {
  try {
    return await reportTemplateRepository.create({
      title: data.title,
      description: data.description,
      version: data.version ?? 1,
      publishedAt: data.publish ? new Date() : null,
      sections: {
        create: mapSectionsToPrisma(data.sections || []),
      },
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new TemplateTitleExistsError();
    }
    throw error;
  }
};

export const getAllTemplates = () => {
  return reportTemplateRepository.findAllActive();
};

export const getPublishedTemplates = () => {
  return reportTemplateRepository.findPublished();
};

export const getTemplateById = async (id: number) => {
  const template = await reportTemplateRepository.findById(id);
  if (!template) throw new TemplateNotFoundError();
  return template;
};

export const publishTemplate = async (id: number, publish: boolean) => {
  await getTemplateById(id);
  return reportTemplateRepository.update(id, {
    publishedAt: publish ? new Date() : null,
    isActive: true,
  });
};

export const updateTemplateMeta = async (id: number, data: any) => {
  await getTemplateById(id);
  return reportTemplateRepository.update(id, {
    title: data.title,
    description: data.description,
    isActive: data.isActive,
  });
};

export const updateTemplateFull = async (id: number, data: any) => {
  await getTemplateById(id);

  const metaData: Prisma.ReportTemplateUpdateInput = {
    title: data.title,
    description: data.description,
    publishedAt: data.publish !== undefined ? (data.publish ? new Date() : null) : undefined,
  };

  const sectionsCreateInput = {
    create: mapSectionsToPrisma(data.sections || []),
  };

  return reportTemplateRepository.replaceContent(id, metaData, sectionsCreateInput);
};

export const cloneTemplate = async (id: number) => {
  const base = await reportTemplateRepository.findById(id);
  if (!base) throw new TemplateNotFoundError();

  const nextVersion = (base.version ?? 1) + 1;
  const newTitle = `${base.title} v${nextVersion}`;

  const sectionsData = base.sections.map((s) => ({
    title: s.title,
    description: s.description,
    order: s.order,
    items: {
      create: s.items.map((it) => ({
        label: it.label,
        description: it.description,
        placeholder: it.placeholder,
        helpText: it.helpText,
        required: it.required,
        maxLength: it.maxLength,
        type: it.type,
        width: it.width,
        options: it.options === null ? Prisma.JsonNull : (it.options as any),
        defaultValue: it.defaultValue === null ? Prisma.JsonNull : (it.defaultValue as any),
        key: it.key,
        order: it.order,
      })),
    },
  }));

  return reportTemplateRepository.create({
    title: newTitle,
    description: base.description,
    version: nextVersion,
    isActive: true,
    publishedAt: null,
    sections: {
      create: sectionsData,
    },
  });
};