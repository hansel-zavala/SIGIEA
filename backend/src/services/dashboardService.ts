// backend/src/services/dashboardService.ts
import { dashboardRepository } from '../repositories/dashboardRepository.js';
import { AuthRequest } from '../types/express.js';

type UserPayload = AuthRequest['user'];

const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const calculatePercentage = (numerator: number, denominator: number): number => {
  if (denominator === 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 100);
};

export const getDashboardStats = async (user: UserPayload) => {
  if (user?.role === 'PARENT' && user.guardian) {
    const studentIds = await dashboardRepository.findStudentIdsByGuardian(user.guardian.id);
    const studentIdList = studentIds.map(s => s.id);

    const [totalSessions, completedSessions, upcomingSessions, recentReports] = await Promise.all([
      dashboardRepository.countSessionsByStudentIds(studentIdList),
      dashboardRepository.countCompletedSessionsByStudentIds(studentIdList),
      dashboardRepository.countUpcomingSessionsByStudentIds(studentIdList),
      dashboardRepository.countReportsByStudentIds(studentIdList)
    ]);

    const attendanceRate = calculatePercentage(completedSessions, totalSessions);

    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
      recentReports,
      attendanceRate,
      childrenCount: studentIds.length
    };
  } else {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [currentMonthStudents, previousMonthStudents] = await Promise.all([
        dashboardRepository.countStudentsCreatedBetween(startOfCurrentMonth, now),
        dashboardRepository.countStudentsCreatedBetween(startOfPreviousMonth, startOfCurrentMonth)
    ]);

    let studentGrowthPercentage = 0;
    if (previousMonthStudents > 0) {
      studentGrowthPercentage = ((currentMonthStudents - previousMonthStudents) / previousMonthStudents) * 100;
    } else if (currentMonthStudents > 0) {
      studentGrowthPercentage = 100;
    }

    const [studentCount, therapistCount, parentCount, leccionCount] = await Promise.all([
      dashboardRepository.countActiveStudents(),
      dashboardRepository.countActiveTherapists(),
      dashboardRepository.countActiveGuardians(),
      dashboardRepository.countActiveLecciones(),
    ]);

    return {
      students: studentCount,
      therapists: therapistCount,
      parents: parentCount,
      lecciones: leccionCount,
      studentGrowthPercentage: Math.round(studentGrowthPercentage),
    };
  }
};

export const getTherapyAttendance = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalSessions, completedSessions] = await Promise.all([
    dashboardRepository.countSessionsBetween(sevenDaysAgo),
    dashboardRepository.countCompletedSessionsBetween(sevenDaysAgo)
  ]);

  const attendanceRate = calculatePercentage(completedSessions, totalSessions);
  return { attendanceRate };
};

export const getStudentAgeDistribution = async () => {
  const students = await dashboardRepository.getStudentBirthDates();
  
  const ageGroups: { [key: number]: number } = {};
  students.forEach(student => {
    if (student.dateOfBirth) {
      const age = calculateAge(student.dateOfBirth);
      ageGroups[age] = (ageGroups[age] || 0) + 1;
    }
  });

  return Object.entries(ageGroups)
    .map(([age, count]) => ({
      age: parseInt(age),
      count
    }))
    .sort((a, b) => a.age - b.age);
};

export const getTherapistWorkload = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const workloadData = await dashboardRepository.getTherapistWorkloadBetween(startOfMonth, endOfMonth);
  if (workloadData.length === 0) return [];

  const therapistIds = workloadData.map(w => w.therapistId);
  const therapists = await dashboardRepository.getTherapistNamesByIds(therapistIds);

  return workloadData.map(item => {
    const therapist = therapists.find(t => t.id === item.therapistId);
    return {
      therapist: therapist ? `${therapist.nombres} ${therapist.apellidos}` : `Terapeuta ${item.therapistId}`,
      load: item._count.id
    };
  });
};

export const getMostFrequentTherapies = async () => {
  const therapyData = await dashboardRepository.getTherapySessionCountsByLeccion(10);
  if (therapyData.length === 0) return [];

  const leccionIds = therapyData.map(t => t.leccionId);
  const lecciones = await dashboardRepository.getLeccionTitlesByIds(leccionIds);

  return therapyData.map(item => {
    const leccion = lecciones.find(l => l.id === item.leccionId);
    return {
      therapy: leccion ? leccion.title : `Lección ${item.leccionId}`,
      count: item._count.id
    };
  });
};

export const getSessionComparison = async (therapistId?: number) => {
  const now = new Date();
  const monthsData = [];

  for (let i = 2; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const [planned, completed, absent, cancelled] = await Promise.all([
      dashboardRepository.countSessionsByStatusBetween('Total', monthStart, monthEnd, therapistId),
      dashboardRepository.countSessionsByStatusBetween('Completada', monthStart, monthEnd, therapistId),
      dashboardRepository.countSessionsByStatusBetween('Ausente', monthStart, monthEnd, therapistId),
      dashboardRepository.countSessionsByStatusBetween('Cancelada', monthStart, monthEnd, therapistId)
    ]);

    monthsData.push({ month: monthName, planned, completed, absent, cancelled });
  }
  return monthsData;
};

export const getGenderDistribution = async () => {
  const [maleCount, femaleCount] = await Promise.all([
    dashboardRepository.countStudentsByGender('Masculino'),
    dashboardRepository.countStudentsByGender('Femenino')
  ]);
  return { maleCount, femaleCount, total: maleCount + femaleCount };
};

export const getStudentBirthDepartmentDistribution = async () => {
  const departmentData = await dashboardRepository.getStudentBirthDepartmentCounts();

  return departmentData.map(item => ({
    department: item.lugarNacimiento || 'Sin especificar',
    count: item._count.id
  }));
};

export const getTherapistAttendanceTrends = async () => {
  const therapists = await dashboardRepository.getActiveTherapists();
  const now = new Date();

  const trendsData = await Promise.all(therapists.map(async (therapist) => {
    const { id: therapistId, nombres, apellidos } = therapist;
    const name = `${nombres} ${apellidos}`;

    const monthly = await Promise.all(Array.from({ length: 6 }).map(async (_, i) => {
      const monthIndex = 5 - i;
      const monthStart = new Date(now.getFullYear(), now.getMonth() - monthIndex, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthIndex + 1, 0);

      const [totalSessions, completedSessions] = await Promise.all([
        dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, monthStart, monthEnd),
        dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, monthStart, monthEnd, 'Completada')
      ]);
      
      return {
        month: monthStart.toLocaleDateString('es-ES', { month: 'short' }),
        attendanceRate: calculatePercentage(completedSessions, totalSessions)
      };
    }));

    const weekly = await Promise.all(Array.from({ length: 4 }).map(async (_, i) => {
      const weekIndex = 3 - i;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (weekIndex * 7) - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const [totalSessions, completedSessions] = await Promise.all([
        dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, weekStart, weekEnd),
        dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, weekStart, weekEnd, 'Completada')
      ]);

      return {
        week: `Sem ${4 - weekIndex}`,
        attendanceRate: calculatePercentage(completedSessions, totalSessions)
      };
    }));

    const yearly = await Promise.all(Array.from({ length: 2 }).map(async (_, i) => {
      const yearIndex = 1 - i;
      const yearStart = new Date(now.getFullYear() - yearIndex, 0, 1);
      const yearEnd = new Date(now.getFullYear() - yearIndex + 1, 0, 0);

      const [totalSessions, completedSessions] = await Promise.all([
        dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, yearStart, yearEnd),
        dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, yearStart, yearEnd, 'Completada')
      ]);

      return {
        year: yearStart.getFullYear().toString(),
        attendanceRate: calculatePercentage(completedSessions, totalSessions)
      };
    }));

    return { id: therapistId, name, weekly, monthly, yearly };
  }));

  return trendsData;
};

export const getTherapistAttendanceById = async (therapistId: number, range: string) => {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
  }

  const [totalSessions, completedSessions] = await Promise.all([
    dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, startDate, now),
    dashboardRepository.countTherapistSessionsByStatusBetween(therapistId, startDate, now, 'Completada')
  ]);

  const attendanceRate = calculatePercentage(completedSessions, totalSessions);
  return { attendanceRate };
};