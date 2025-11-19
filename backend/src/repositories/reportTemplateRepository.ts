// backend/src/repositories/reportTemplateRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const create = (data: Prisma.ReportTemplateCreateInput) => {
  return prisma.reportTemplate.create({
    data,
    include: {
      sections: {
        include: { items: true },
      },
    },
  });
};

const findAllActive = () => {
  return prisma.reportTemplate.findMany({
    where: { isActive: true },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          items: { orderBy: { order: 'asc' } },
        },
      },
    },
    orderBy: [{ title: 'asc' }, { version: 'desc' }],
  });
};

const findPublished = () => {
  return prisma.reportTemplate.findMany({
    where: { isActive: true, publishedAt: { not: null } },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: { items: { orderBy: { order: 'asc' } } },
      },
    },
    orderBy: [{ title: 'asc' }, { version: 'desc' }],
  });
};

const findById = (id: number) => {
  return prisma.reportTemplate.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: { items: { orderBy: { order: 'asc' } } },
      },
    },
  });
};

const update = (id: number, data: Prisma.ReportTemplateUpdateInput) => {
  return prisma.reportTemplate.update({
    where: { id },
    data,
  });
};

const replaceContent = async (
  templateId: number,
  metaData: Prisma.ReportTemplateUpdateInput,
  sectionsCreateInput: Prisma.ReportSectionUpdateManyWithoutTemplateNestedInput
) => {
  return prisma.$transaction(async (tx) => {
    await tx.reportTemplate.update({
      where: { id: templateId },
      data: metaData,
    });

    await tx.reportItemAnswer.deleteMany({ where: { item: { section: { templateId } } } });
    await tx.reportItem.deleteMany({ where: { section: { templateId } } });
    await tx.reportSection.deleteMany({ where: { templateId } });

    await tx.reportTemplate.update({
      where: { id: templateId },
      data: {
        sections: sectionsCreateInput,
      },
    });

    return tx.reportTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { items: { orderBy: { order: 'asc' } } },
        },
      },
    });
  });
};

export const reportTemplateRepository = {
  create,
  findAllActive,
  findPublished,
  findById,
  update,
  replaceContent,
};