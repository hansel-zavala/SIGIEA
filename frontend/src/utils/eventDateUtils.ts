const pad = (value: number | string) => value.toString().padStart(2, '0');

export const DEFAULT_EVENT_START_TIME = '08:00';
export const DEFAULT_EVENT_END_TIME = '17:00';

export const toDateOnlyString = (value: string): string => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

export const toDateTimeString = (value: string, fallbackTime: string): string => {
  if (!value) return '';
  if (!value.includes('T')) {
    return `${value}T${fallbackTime}`;
  }

  const [datePart, timePart] = value.split('T');
  const [hours = '00', minutes = '00'] = timePart.split(':');
  return `${datePart}T${pad(hours)}:${pad(minutes)}`;
};

export const ensureEndNotBeforeStart = (start: string, end: string): string => {
  if (!start || !end) return end;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return endDate < startDate ? start : end;
};

export const areDatesValidRange = (start: string, end: string): boolean => {
  if (!start || !end) return false;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return endDate >= startDate;
};

export const isBeforeToday = (value: string, isAllDay: boolean): boolean => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  if (isAllDay) {
    today.setHours(0, 0, 0, 0);
  }

  return date < today;
};

export const parseDateValue = (value: string, isAllDay: boolean): Date | null => {
  if (!value) return null;
  if (isAllDay) {
    const [yearStr, monthStr, dayStr] = value.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};
