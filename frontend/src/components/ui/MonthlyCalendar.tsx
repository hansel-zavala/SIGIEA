import { useState, useMemo } from 'react';
import { type Event } from '../../services/eventService';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface MonthlyCalendarProps {
    events?: Event[];
    onEventClick?: (event: Event) => void;
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

/** Check if a date string falls on a given year/month/day */
function eventFallsOnDay(event: Event, year: number, month: number, day: number) {
    const target = new Date(year, month, day);
    const targetStr = target.toDateString();

    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : start;

    // For all-day events, compare date-only
    if (event.isAllDay) {
        const startDate = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
        const endDate = new Date(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
        return target >= startDate && target <= endDate;
    }

    // For timed events, check if the day matches start or end date
    return start.toDateString() === targetStr || end.toDateString() === targetStr;
}

function formatEventTime(event: Event): string {
    if (event.isAllDay) return 'Todo el día';

    const fmt = (iso: string) =>
        new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

    const startTime = fmt(event.startDate);
    const endTime = event.endDate ? fmt(event.endDate) : '';
    return endTime ? `${startTime} - ${endTime}` : startTime;
}

export default function MonthlyCalendar({ events = [], onEventClick }: MonthlyCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    const calendarGrid = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

        const cells: { day: number; isCurrentMonth: boolean }[] = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, isCurrentMonth: true });
        }
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) {
            cells.push({ day: d, isCurrentMonth: false });
        }

        return cells;
    }, [currentMonth, currentYear]);

    // Set of days that have events (for dot indicators)
    const daysWithEvents = useMemo(() => {
        const set = new Set<number>();
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        for (let d = 1; d <= daysInMonth; d++) {
            if (events.some((ev) => eventFallsOnDay(ev, currentYear, currentMonth, d))) {
                set.add(d);
            }
        }
        return set;
    }, [events, currentMonth, currentYear]);

    // Events for the selected day
    const selectedDayEvents = useMemo(
        () => events.filter((ev) => eventFallsOnDay(ev, currentYear, currentMonth, selectedDay)),
        [events, currentYear, currentMonth, selectedDay],
    );

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
        setSelectedDay(1);
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
        setSelectedDay(1);
    };

    return (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Calendario</h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={goToPrevMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Mes anterior"
                    >
                        ‹
                    </button>
                    <span className="min-w-[140px] text-center text-sm font-medium text-gray-700">
                        {MONTH_NAMES[currentMonth]} {currentYear}
                    </span>
                    <button
                        onClick={goToNextMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Mes siguiente"
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Day-of-week headers */}
            <div className="mb-2 grid grid-cols-7 text-center">
                {DAYS_OF_WEEK.map((d) => (
                    <span key={d} className="pb-3 text-xs font-medium tracking-wide text-gray-400">
                        {d}
                    </span>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 text-center">
                {calendarGrid.map((cell, idx) => {
                    const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
                    const hasEvents = cell.isCurrentMonth && daysWithEvents.has(cell.day);
                    return (
                        <button
                            key={idx}
                            onClick={() => cell.isCurrentMonth && setSelectedDay(cell.day)}
                            className={`
                relative flex h-10 w-full items-center justify-center text-sm transition-all
                ${cell.isCurrentMonth
                                    ? isSelected
                                        ? 'mx-auto rounded-xl bg-gray-900 font-semibold text-white'
                                        : 'font-medium text-gray-700 hover:rounded-xl hover:bg-gray-100'
                                    : 'cursor-default text-gray-300'
                                }
              `}
                            disabled={!cell.isCurrentMonth}
                        >
                            {cell.day}
                            {hasEvents && !isSelected && (
                                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500" />
                            )}
                            {hasEvents && isSelected && (
                                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Events section */}
            <div className="mt-8">
                <h4 className="mb-4 text-sm font-semibold text-gray-700">Eventos del día</h4>
                {selectedDayEvents.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay eventos para este día.</p>
                ) : (
                    <div className="space-y-3">
                        {selectedDayEvents.map((ev) => (
                            <button
                                key={ev.id}
                                type="button"
                                onClick={() => onEventClick?.(ev)}
                                className="flex w-full items-start gap-3 rounded-xl bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                            >
                                <span
                                    className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: ev.category?.color || '#6b7280' }}
                                    aria-hidden
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                                    <p className="text-xs text-gray-400">{formatEventTime(ev)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
