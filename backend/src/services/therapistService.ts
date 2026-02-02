// backend/src/services/therapistService.ts
import { therapistRepository } from "../repositories/therapistRepository.js";
import {
  TherapistNotFoundError,
  EmailInUseError,
  IdentityInUseError,
} from "../errors/therapistErrors.js";
import bcrypt from "bcrypt";
import { Role, PermissionType, Prisma } from "@prisma/client";
import {
  toCsv,
  sendCsvResponse,
  buildTimestampedFilename,
} from "../utils/csv.js";
import { sendExcelResponse } from "../utils/excel.js";
import { sendPdfTableResponse } from "../utils/pdf.js";
import type { Response } from "express";

const DEFAULT_PERMISSIONS = [
  PermissionType.VIEW_STUDENTS,
  PermissionType.EDIT_STUDENTS,
  PermissionType.MANAGE_SESSIONS,
  PermissionType.VIEW_REPORTS,
  PermissionType.CREATE_REPORTS,
  PermissionType.MANAGE_DOCUMENTS,
  PermissionType.VIEW_GUARDIANS,
  PermissionType.VIEW_EVENTS,
  PermissionType.VIEW_THERAPISTS,
  PermissionType.VIEW_MATRICULA,
  PermissionType.VIEW_TEMPLATES,
  PermissionType.VIEW_DASHBOARD,
  PermissionType.VIEW_CONTROLS,
  PermissionType.VIEW_DOCUMENTS,
  PermissionType.UPLOAD_FILES,
  PermissionType.DOWNLOAD_FILES,
];

export const createTherapist = async (data: any) => {
  const {
    nombres,
    apellidos,
    email,
    password,
    identityNumber,
    lugarNacimiento,
    direccion,
    specialty,
    hireDate,
    identityCardUrl,
    resumeUrl,
    workDays,
    workStartTime,
    workEndTime,
    lunchStartTime,
    lunchEndTime,
    ...profileData
  } = data;

  const existingUser = await therapistRepository.findByEmail(email);
  if (existingUser) throw new EmailInUseError();

  const existingProfile =
    await therapistRepository.findByIdentityNumber(identityNumber);
  if (existingProfile) throw new IdentityInUseError();

  const hashedPassword = await bcrypt.hash(password, 10);
  const fullName = `${nombres} ${apellidos}`;

  const createData: Prisma.TherapistProfileCreateInput = {
    ...profileData,
    nombres,
    apellidos,
    email,
    identityNumber,
    lugarNacimiento,
    direccion,
    specialty,
    hireDate: hireDate ? new Date(hireDate) : new Date(),
    identityCardUrl,
    resumeUrl,
    workDays: workDays || ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    workEndTime,
    lunchStartTime,
    lunchEndTime,
    user: {
      create: {
        email,
        password: hashedPassword,
        role: Role.THERAPIST,
        name: fullName,
      },
    },
    permissions: {
      create: DEFAULT_PERMISSIONS.map((p) => ({
        permission: p,
        granted: true,
      })),
    },
  };

  if (profileData.dateOfBirth) {
    createData.dateOfBirth = new Date(profileData.dateOfBirth);
  }

  return therapistRepository.create(createData);
};

export const getAllTherapists = async (query: any, user: any) => {
  const { search, page = "1", limit = "10", status } = query;
  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = parseInt(String(limit), 10);
  const skip = (pageNum - 1) * limitNum;

  const whereCondition: Prisma.TherapistProfileWhereInput = {};

  if (user?.role === "PARENT" && user.guardian) {
    whereCondition.assignedStudents = {
      some: { guardians: { some: { id: user.guardian.id } } },
    };
  }

  if (status === "active") whereCondition.isActive = true;
  else if (status === "inactive") whereCondition.isActive = false;

  if (search) {
    const terms = String(search).trim().split(/\s+/);
    whereCondition.AND = terms.map((term) => ({
      OR: [
        { nombres: { contains: term } },
        { apellidos: { contains: term } },
        { specialty: { contains: term } },
      ],
    }));
  }

  const [therapists, total] = await therapistRepository.findAndCountAll(
    whereCondition,
    skip,
    limitNum,
  );

  const data = therapists.map((t) => ({
    ...t,
    fullName: `${t.nombres} ${t.apellidos}`,
  }));

  return {
    data,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getTherapistById = async (id: number) => {
  const therapist = await therapistRepository.findById(id);
  if (!therapist) throw new TherapistNotFoundError();

  const assignedStudents = therapist.assignedStudents.map((student) => {
    const {
      atencionGrupal,
      atencionIndividual,
      atencionPrevocacional,
      atencionDistancia,
      terapiaDomicilio,
      atencionVocacional,
      inclusionEscolar,
      educacionFisica,
      ...rest
    } = student as any;

    return {
      ...rest,
      fullName: `${student.nombres} ${student.apellidos}`,
      tipoAtencion: {
        atencionGrupal,
        atencionIndividual,
        atencionPrevocacional,
        atencionDistancia,
        terapiaDomicilio,
        atencionVocacional,
        inclusionEscolar,
        educacionFisica,
      },
    };
  });

  return {
    ...therapist,
    fullName: `${therapist.nombres} ${therapist.apellidos}`,
    assignedStudents,
  };
};

export const updateTherapist = async (id: number, data: any) => {
  const { email, nombres, apellidos, password, ...profileData } = data;

  const profile = await therapistRepository.findByIdForUpdate(id);
  if (!profile) throw new TherapistNotFoundError();

  if (email || password || nombres || apellidos) {
    const userData: Prisma.UserUpdateInput = {};
    if (email) userData.email = email;
    if (password) userData.password = await bcrypt.hash(password, 10);
    if (nombres || apellidos) {
      userData.name = `${nombres ?? profile.nombres} ${apellidos ?? profile.apellidos}`;
    }
    await therapistRepository.updateUser(profile.userId, userData);
  }

  if (profileData.dateOfBirth)
    profileData.dateOfBirth = new Date(profileData.dateOfBirth);
  if (profileData.hireDate)
    profileData.hireDate = new Date(profileData.hireDate);

  return therapistRepository.updateProfile(id, {
    email,
    nombres,
    apellidos,
    ...profileData,
  });
};

export const toggleTherapistStatus = async (id: number, isActive: boolean) => {
  return therapistRepository.updateProfile(id, { isActive });
};

export const exportTherapists = async (query: any, res: Response) => {
  const { status = "all", format = "csv" } = query;

  const where: Prisma.TherapistProfileWhereInput = {};
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const therapists = await therapistRepository.findAllForExport(where);
  const filenameBase = `terapeutas-${status}`;

  const processedData = therapists.map((t) => {
    const primaryStudent = t.assignedStudents[0];
    return {
      id: t.id,
      fullName: `${t.nombres} ${t.apellidos}`,
      identityNumber: t.identityNumber,
      specialty: t.specialty,
      email: t.email,
      fullnamestudent: primaryStudent
        ? `${primaryStudent.nombres} ${primaryStudent.apellidos}`
        : "N/A",
      createAt: t.createdAt.toISOString().split("T")[0],
      isActive: t.isActive ? "Activo" : "Inactivo",
    };
  });

  const headers = [
    { key: "id", header: "Id", width: 10 },
    { key: "fullName", header: "Nombre Completo", width: 30 },
    { key: "identityNumber", header: "Número de identidad", width: 20 },
    { key: "specialty", header: "Especialidad", width: 20 },
    { key: "email", header: "Correo electrónico", width: 30 },
    { key: "createAt", header: "Fecha de registro", width: 20 },
    { key: "isActive", header: "Estado", width: 15 },
  ];

  const dataRows = processedData.map((t) => [
    t.id,
    t.fullName,
    t.identityNumber,
    t.specialty,
    t.email,
    t.createAt,
    t.isActive,
  ]);

  if (format === "excel") {
    await sendExcelResponse(
      res,
      buildTimestampedFilename(filenameBase, "xlsx"),
      headers,
      processedData,
    );
  } else if (format === "pdf") {
    await sendPdfTableResponse(
      res,
      buildTimestampedFilename(filenameBase, "pdf"),
      {
        title: "Lista de Terapeutas",
        headers: headers.map((h) => h.header),
        rows: dataRows,
      },
    );
  } else {
    const csvContent = toCsv(
      headers.map((h) => h.header),
      dataRows,
    );
    sendCsvResponse(
      res,
      buildTimestampedFilename(filenameBase, "csv"),
      csvContent,
    );
  }
};

export const exportAssignedStudents = async (
  id: number,
  format: string,
  res: Response,
) => {
  const therapist = await therapistRepository.findByIdWithStudents(id);
  if (!therapist) throw new TherapistNotFoundError();

  const filenameBase =
    `alumnos-asignados-${therapist.nombres}-${therapist.apellidos}`
      .toLowerCase()
      .replace(/\s+/g, "-");

  const processedData = therapist.assignedStudents.map((s) => {
    const types =
      [
        s.atencionIndividual && "Individual",
        s.atencionGrupal && "Grupal",
        s.atencionPrevocacional && "Prevocacional",
        s.atencionDistancia && "A distancia",
        s.terapiaDomicilio && "Domicilio",
        s.atencionVocacional && "Vocacional",
        s.inclusionEscolar && "Inclusión Escolar",
        s.educacionFisica && "Educación Física",
      ]
        .filter(Boolean)
        .join(", ") || "No especificado";

    return {
      id: s.id,
      fullName: `${s.nombres} ${s.apellidos}`,
      dateOfBirth: s.dateOfBirth.toISOString().split("T")[0],
      jornada: s.jornada || "No especificada",
      genero: s.genero || "No especificado",
      tiposDeAtencion: types,
    };
  });

  const headers = [
    { key: "id", header: "ID", width: 10 },
    { key: "fullName", header: "Nombre Completo", width: 30 },
    { key: "dateOfBirth", header: "Fecha de Nacimiento", width: 20 },
    { key: "jornada", header: "Jornada", width: 20 },
    { key: "genero", header: "Género", width: 15 },
    { key: "tiposDeAtencion", header: "Tipos de Atención", width: 40 },
  ];

  const dataRows = processedData.map((s) => [
    s.id,
    s.fullName,
    s.dateOfBirth,
    s.jornada,
    s.genero,
    s.tiposDeAtencion,
  ]);

  if (format === "excel") {
    await sendExcelResponse(
      res,
      buildTimestampedFilename(filenameBase, "xlsx"),
      headers,
      processedData,
    );
  } else if (format === "pdf") {
    await sendPdfTableResponse(
      res,
      buildTimestampedFilename(filenameBase, "pdf"),
      {
        title: `Alumnos Asignados a ${therapist.nombres} ${therapist.apellidos}`,
        headers: headers.map((h) => h.header),
        rows: dataRows,
      },
    );
  } else {
    const csvContent = toCsv(
      headers.map((h) => h.header),
      dataRows,
    );
    sendCsvResponse(
      res,
      buildTimestampedFilename(filenameBase, "csv"),
      csvContent,
    );
  }
};
