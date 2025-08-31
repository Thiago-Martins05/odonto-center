import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// Set Portuguese locale
dayjs.locale('pt-br');

export function parseHHMM(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}
