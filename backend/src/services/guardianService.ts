// backend/src/services/guardianService.ts
import { guardianRepository } from '../repositories/guardianRepository.js';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { GuardianNotFoundError, EmailInUseError, ReactivationError } from '../errors/guardianErrors.js';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js'; 
import { sendExcelResponse } from '../utils/excel.js';
import { sendPdfTableResponse } from '../utils/pdf.js';
import type { Response } from 'express';

const buildSearchWhere = (status: string, search: string): Prisma.GuardianWhereInput => {
  let whereCondition: Prisma.GuardianWhereInput = {};

  if (status === 'active') {
    whereCondition.isActive = true;
  } else if (status === 'inactive') {
    whereCondition.isActive = false;
  }

  if (search) {
    const raw = String(search).trim();
    const terms = raw.split(/\s+/).filter(Boolean);
    whereCondition.AND = terms.map((term: string) => ({
      OR: [
        { nombres: { contains: term } },
        { apellidos: { contains: term } },
        { numeroIdentidad: { contains: term } },
        { students: { some: { OR: [{ nombres: { contains: term } }, { apellidos: { contains: term } }] } } },
      ],
    }));
  }
  return whereCondition;
};

export const getAllGuardians = async (query: any) => {
  const { search = '', page = '1', limit = '10', status = 'all' } = query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where = buildSearchWhere(status, search);

  const [guardians, totalGuardians] = await guardianRepository.findAndCountGuardians(where, skip, limitNum);

  const guardiansWithFullName = guardians.map(g => ({
      ...g,
      fullName: `${g.nombres} ${g.apellidos}`,
      students: g.students.map(s => ({
          ...s,
          fullName: `${s.nombres} ${s.apellidos}`
      }))
  }));

  return {
    data: guardiansWithFullName,
    total: totalGuardians,
    page: pageNum,
    totalPages: Math.ceil(totalGuardians / limitNum),
  };
};

export const getGuardianById = async (id: number) => {
  const guardian = await guardianRepository.findById(id);
  if (!guardian) {
    throw new GuardianNotFoundError();
  }
  return {
    ...guardian,
    fullName: `${guardian.nombres} ${guardian.apellidos}`,
    students: guardian.students.map(s => ({
      ...s,
      fullName: `${s.nombres} ${s.apellidos}`,
    })),
  };
};

export const updateGuardian = async (id: number, body: any) => {
  const { email, password, ...guardianData } = body;

  const guardian = await guardianRepository.findByIdForUpdate(id);
  if (!guardian) {
    throw new GuardianNotFoundError();
  }

  if (email || password) {
    if (email) {
      const existing = await guardianRepository.findUserByEmail(email);
      if (existing && existing.id !== guardian.userId) {
        throw new EmailInUseError();
      }
    }

    const name = `${guardianData.nombres ?? guardian.nombres} ${guardianData.apellidos ?? guardian.apellidos}`;

    if (guardian.userId) {
      await guardianRepository.updateUser(guardian.userId, {
        ...(email && { email }),
        ...(password && { password: await bcrypt.hash(String(password), 10) }),
        name,
      });
    } else if (email && password) {
      const newUser = await guardianRepository.createUser({
        email,
        password: await bcrypt.hash(String(password), 10),
        role: Role.PARENT,
        name,
      });
      guardianData.userId = newUser.id;
    }
  }

  return guardianRepository.update(id, guardianData);
};

export const deleteGuardian = (id: number) => {
  return guardianRepository.update(id, { isActive: false });
};

export const reactivateGuardian = async (id: number) => {
  const guardian = await guardianRepository.findByIdWithStudents(id);
  if (!guardian) {
    throw new GuardianNotFoundError();
  }

  const hasActiveStudent = guardian.students.some(s => s.isActive);
  if (!hasActiveStudent) {
    throw new ReactivationError('No se puede reactivar al guardián porque ninguno de sus estudiantes asociados está activo.');
  }

  return guardianRepository.update(id, { isActive: true });
};

export const exportGuardians = async (query: any, res: Response) => {
  const { status = 'all', format = 'csv' } = query;
  const where = buildSearchWhere(status, '');

  const guardians = await guardianRepository.findAllForExport(where);
  const filenameBase = `guardians-${status}`;

  const processedData = guardians.map(g => {
    const primaryStudent = g.students[0];
    return {
      id: g.id,
      fullName: `${g.nombres} ${g.apellidos}`,
      numeroIdentidad: g.numeroIdentidad,
      telefono: g.telefono,
      parentesco: g.parentesco,
      fullnamestudent: primaryStudent ? `${primaryStudent.nombres} ${primaryStudent.apellidos}` : 'N/A',
      isActive: g.isActive,
    };
  });

  const headersForExcel = [
    { key: 'id', header: 'Id', width: 10 },
    { key: 'fullName', header: 'Nombre Completo', width: 30 },
    { key: 'numeroIdentidad', header: 'Número de Identidad', width: 20 },
    { key: 'telefono', header: 'Teléfono', width: 20 },
    { key: 'parentesco', header: 'Parentesco', width: 20 },
    { key: 'fullnamestudent', header: 'Nombre del Estudiante', width: 35 },
    { key: 'isActive', header: 'Estado', width: 15 },
  ];
  const dataForExcel = processedData.map((g) => ({ ...g, isActive: g.isActive ? 'Activo' : 'Inactivo' }));

  const headersForPdfAndCsv = ['Id', 'Nombre Completo', 'Número de Identidad', 'Teléfono', 'Parentesco', 'Nombre del Estudiante', 'Estado'];
  const dataForPdfAndCsv = processedData.map((g) => [
    g.id, g.fullName, g.numeroIdentidad, g.telefono, g.parentesco, g.fullnamestudent, g.isActive ? 'Activo' : 'Inactivo',
  ]);

  switch (format) {
    case 'excel':
      await sendExcelResponse(res, buildTimestampedFilename(filenameBase, 'xlsx'), headersForExcel, dataForExcel);
      break;
    case 'pdf':
      sendPdfTableResponse(res, buildTimestampedFilename(filenameBase, 'pdf'), {
        title: 'Lista de Padres', headers: headersForPdfAndCsv, rows: dataForPdfAndCsv,
      });
      break;
    default:
      const csvContent = toCsv(headersForPdfAndCsv, dataForPdfAndCsv);
      sendCsvResponse(res, buildTimestampedFilename(filenameBase, 'csv'), csvContent);
      break;
  }
};