// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import { AuthRequest } from '../types/express.js';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'PARENT' && req.user.guardian) {
      // Personalized stats for parents
      const studentIds = await prisma.student.findMany({
        where: {
          guardians: { some: { id: req.user.guardian.id } },
          isActive: true
        },
        select: { id: true }
      });

      const studentIdList = studentIds.map(s => s.id);

      const [totalSessions, completedSessions, upcomingSessions, recentReports] = await Promise.all([
        prisma.therapySession.count({
          where: { studentId: { in: studentIdList } }
        }),
        prisma.therapySession.count({
          where: {
            studentId: { in: studentIdList },
            status: 'Completada'
          }
        }),
        prisma.therapySession.count({
          where: {
            studentId: { in: studentIdList },
            startTime: { gte: new Date() }
          }
        }),
        prisma.report.count({
          where: { studentId: { in: studentIdList } }
        })
      ]);

      const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      res.json({
        totalSessions,
        completedSessions,
        upcomingSessions,
        recentReports,
        attendanceRate,
        childrenCount: studentIds.length
      });
    } else {
      // Admin/Therapist global stats
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentMonthStudents = await prisma.student.count({
        where: { createdAt: { gte: startOfCurrentMonth } },
      });
      const previousMonthStudents = await prisma.student.count({
        where: {
          createdAt: {
            gte: startOfPreviousMonth,
            lt: startOfCurrentMonth,
          },
        },
      });

      let studentGrowthPercentage = 0;
      if (previousMonthStudents > 0) {
        studentGrowthPercentage = ((currentMonthStudents - previousMonthStudents) / previousMonthStudents) * 100;
      } else if (currentMonthStudents > 0) {
        studentGrowthPercentage = 100;
      }

      const [studentCount, therapistCount, parentCount, leccionCount] = await Promise.all([
        prisma.student.count({ where: { isActive: true } }),
        prisma.therapistProfile.count({ where: { isActive: true } }),
        prisma.guardian.count({ where: { isActive: true } }),
        prisma.leccion.count({ where: { isActive: true } }),
      ]);

      res.json({
        students: studentCount,
        therapists: therapistCount,
        parents: parentCount,
        lecciones: leccionCount,
        studentGrowthPercentage: Math.round(studentGrowthPercentage),
      });
    }
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas.' });
  }
};

export const getTherapyAttendance = async (req: Request, res: Response) => {
  try {
    // Calculate attendance rate for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalSessions, completedSessions] = await Promise.all([
      prisma.therapySession.count({
        where: {
          startTime: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.therapySession.count({
        where: {
          status: 'Completada',
          startTime: {
            gte: sevenDaysAgo
          }
        }
      })
    ]);

    const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    res.json({ attendanceRate });
  } catch (error) {
    console.error("Error al obtener la asistencia a terapias:", error);
    res.status(500).json({ error: 'No se pudo obtener la asistencia.' });
  }
};

export const getStudentAgeDistribution = async (req: Request, res: Response) => {
  try {
    // Get all active students with birth dates
    const students = await prisma.student.findMany({
      where: {
        isActive: true
      },
      select: {
        dateOfBirth: true
      }
    });

    // Calculate ages and group
    const ageGroups: { [key: number]: number } = {};

    students.forEach(student => {
      if (student.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(student.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        ageGroups[age] = (ageGroups[age] || 0) + 1;
      }
    });

    // Convert to array format
    const ageDistribution = Object.entries(ageGroups)
      .map(([age, count]) => ({
        age: parseInt(age),
        count
      }))
      .sort((a, b) => a.age - b.age);

    res.json(ageDistribution);
  } catch (error) {
    console.error("Error al obtener la distribución por edad:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};

export const getTherapistWorkload = async (req: Request, res: Response) => {
  try {
    // Get current month sessions per therapist
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const workloadData = await prisma.therapySession.groupBy({
      by: ['therapistId'],
      where: {
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _count: {
        id: true
      }
    });

    // Get therapist names
    const therapistIds = workloadData.map(w => w.therapistId);
    const therapists = await prisma.therapistProfile.findMany({
      where: {
        id: {
          in: therapistIds
        }
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true
      }
    });

    // Combine data
    const workload = workloadData.map(item => {
      const therapist = therapists.find(t => t.id === item.therapistId);
      return {
        therapist: therapist ? `${therapist.nombres} ${therapist.apellidos}` : `Terapeuta ${item.therapistId}`,
        load: item._count.id
      };
    });

    res.json(workload);
  } catch (error) {
    console.error("Error al obtener la carga de trabajo:", error);
    res.status(500).json({ error: 'No se pudo obtener la carga de trabajo.' });
  }
};

export const getMostFrequentTherapies = async (req: Request, res: Response) => {
  try {
    // Group therapy sessions by leccion title
    const therapyData = await prisma.therapySession.groupBy({
      by: ['leccionId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10 // Top 10
    });

    // Get leccion titles
    const leccionIds = therapyData.map(t => t.leccionId);
    const lecciones = await prisma.leccion.findMany({
      where: {
        id: {
          in: leccionIds
        }
      },
      select: {
        id: true,
        title: true,
        category: true
      }
    });

    // Combine data
    const therapies = therapyData.map(item => {
      const leccion = lecciones.find(l => l.id === item.leccionId);
      return {
        therapy: leccion ? leccion.title : `Lección ${item.leccionId}`,
        count: item._count.id
      };
    });

    res.json(therapies);
  } catch (error) {
    console.error("Error al obtener las terapias más frecuentes:", error);
    res.status(500).json({ error: 'No se pudieron obtener las terapias.' });
  }
};

export const getSessionComparison = async (req: Request, res: Response) => {
  try {
    // Get last 3 months data
    const now = new Date();
    const months = [];

    const therapistIdParam = req.query.therapistId as string | undefined;
    const therapistIdFilter = therapistIdParam && !isNaN(parseInt(therapistIdParam)) ? parseInt(therapistIdParam) : undefined;

    for (let i = 2; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthName = monthStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      // Count sessions by status for this month
      const [planned, completed, absent, cancelled] = await Promise.all([
        prisma.therapySession.count({
          where: {
            ...(therapistIdFilter ? { therapistId: therapistIdFilter } : {}),
            startTime: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.therapySession.count({
          where: {
            status: 'Completada',
            ...(therapistIdFilter ? { therapistId: therapistIdFilter } : {}),
            startTime: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.therapySession.count({
          where: {
            status: 'Ausente',
            ...(therapistIdFilter ? { therapistId: therapistIdFilter } : {}),
            startTime: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.therapySession.count({
          where: {
            status: 'Cancelada',
            ...(therapistIdFilter ? { therapistId: therapistIdFilter } : {}),
            startTime: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      ]);

      months.push({
        month: monthName,
        planned,
        completed,
        absent,
        cancelled
      });
    }

    res.json(months);
  } catch (error) {
    console.error("Error al obtener la comparación de sesiones:", error);
    res.status(500).json({ error: 'No se pudo obtener la comparación.' });
  }
};

export const getGenderDistribution = async (req: Request, res: Response) => {
  try {
    const [maleResult, femaleResult] = await Promise.all([
      prisma.student.count({
        where: {
          genero: 'Masculino',
          isActive: true
        }
      }),
      prisma.student.count({
        where: {
          genero: 'Femenino',
          isActive: true
        }
      })
    ]);

    const maleCount = maleResult;
    const femaleCount = femaleResult;
    const total = maleCount + femaleCount;

    res.json({ maleCount, femaleCount, total });
  } catch (error) {
    console.error("Error al obtener la distribución por género:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};

export const getStudentBirthDepartmentDistribution = async (req: Request, res: Response) => {
  try {
    // Group students by lugarNacimiento (birth place) and count
    const departmentData = await prisma.student.groupBy({
      by: ['lugarNacimiento'],
      where: {
        isActive: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Filter out null lugarNacimiento
    const filteredData = departmentData.filter(item => item.lugarNacimiento !== null);

    // Transform to expected format
    const result = filteredData.map(item => ({
      department: item.lugarNacimiento || 'Sin especificar',
      count: item._count.id
    }));

    res.json(result);
  } catch (error) {
    console.error("Error al obtener la distribución por departamento de nacimiento:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};

export const getTherapistAttendanceTrends = async (req: Request, res: Response) => {
  try {
    // Get all active therapists
    const therapists = await prisma.therapistProfile.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nombres: true,
        apellidos: true
      }
    });

    const trendsData = await Promise.all(therapists.map(async (therapist) => {
      const therapistId = therapist.id;
      const name = `${therapist.nombres} ${therapist.apellidos}`;

      // Calculate monthly attendance for last 6 months
      const monthly = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const [totalSessions, completedSessions] = await Promise.all([
          prisma.therapySession.count({
            where: {
              therapistId,
              startTime: {
                gte: monthStart,
                lte: monthEnd
              }
            }
          }),
          prisma.therapySession.count({
            where: {
              therapistId,
              status: 'Completada',
              startTime: {
                gte: monthStart,
                lte: monthEnd
              }
            }
          })
        ]);

        const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short' });

        monthly.push({ month: monthName, attendanceRate });
      }

      // Calculate weekly attendance for last 4 weeks
      const weekly = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const [totalSessions, completedSessions] = await Promise.all([
          prisma.therapySession.count({
            where: {
              therapistId,
              startTime: {
                gte: weekStart,
                lte: weekEnd
              }
            }
          }),
          prisma.therapySession.count({
            where: {
              therapistId,
              status: 'Completada',
              startTime: {
                gte: weekStart,
                lte: weekEnd
              }
            }
          })
        ]);

        const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        weekly.push({ week: `Sem ${4 - i}`, attendanceRate });
      }

      // Calculate yearly attendance for last 2 years
      const yearly = [];
      for (let i = 1; i >= 0; i--) {
        const yearStart = new Date(now.getFullYear() - i, 0, 1);
        const yearEnd = new Date(now.getFullYear() - i + 1, 0, 0);

        const [totalSessions, completedSessions] = await Promise.all([
          prisma.therapySession.count({
            where: {
              therapistId,
              startTime: {
                gte: yearStart,
                lte: yearEnd
              }
            }
          }),
          prisma.therapySession.count({
            where: {
              therapistId,
              status: 'Completada',
              startTime: {
                gte: yearStart,
                lte: yearEnd
              }
            }
          })
        ]);

        const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        yearly.push({ year: yearStart.getFullYear().toString(), attendanceRate });
      }

      return {
        id: therapistId,
        name,
        weekly,
        monthly,
        yearly
      };
    }));

    res.json(trendsData);
  } catch (error) {
    console.error("Error al obtener las tendencias de asistencia de terapeutas:", error);
    res.status(500).json({ error: 'No se pudieron obtener las tendencias.' });
  }
};

export const getTherapistAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { range } = req.query;
    const therapistId = parseInt(id);

    if (isNaN(therapistId)) {
      return res.status(400).json({ error: 'ID de terapeuta inválido' });
    }

    // Calculate date range based on range parameter
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
        startDate.setDate(now.getDate() - 7); // Default to week
    }

    // Count total sessions and completed sessions for the therapist in the date range
    const [totalSessions, completedSessions] = await Promise.all([
      prisma.therapySession.count({
        where: {
          therapistId,
          startTime: {
            gte: startDate,
            lte: now
          }
        }
      }),
      prisma.therapySession.count({
        where: {
          therapistId,
          status: 'Completada',
          startTime: {
            gte: startDate,
            lte: now
          }
        }
      })
    ]);

    const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    res.json({ attendanceRate });
  } catch (error) {
    console.error(`Error al obtener la asistencia del terapeuta ${req.params.id}:`, error);
    res.status(500).json({ error: 'No se pudo obtener la asistencia.' });
  }
};