import { format, formatDistance } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'PPp');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm');
}


