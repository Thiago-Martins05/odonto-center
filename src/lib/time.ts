import dayjs from "dayjs";
import "dayjs/locale/pt-br";

// Set Portuguese locale
dayjs.locale("pt-br");

export function parseHHMM(timeString: string): {
  hours: number;
  minutes: number;
} {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function startEndOfWeek(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = 1

  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

export function formatPt(date: Date, withTime = false): string {
  if (withTime) {
    return dayjs(date).format("DD/MM/YYYY HH:mm");
  }
  return dayjs(date).format("DD/MM/YYYY");
}

export function getCurrentTime(): string {
  return dayjs().format("HH:mm");
}

export function isTimeInRange(
  time: string,
  start: string,
  end: string
): boolean {
  const timeObj = dayjs(`2000-01-01 ${time}`);
  const startObj = dayjs(`2000-01-01 ${start}`);
  const endObj = dayjs(`2000-01-01 ${end}`);

  return timeObj.isAfter(startObj) && timeObj.isBefore(endObj);
}

export function getWeekdayName(weekday: number): string {
  const weekdays = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return weekdays[weekday];
}

export function getShortWeekdayName(weekday: number): string {
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return weekdays[weekday];
}
