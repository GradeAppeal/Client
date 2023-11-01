import { Router } from '@angular/router';

export const setTitle = (url: string): string => {
  const segments = url.split('/');
  let title = '';

  for (let i = 0; i < segments.length; i++) {
    if (segments[i] === 'professor' || segments[i] === 'student') {
      title = segments
        .slice(i + 1)
        .map((segment) => capitalizeWords(segment))
        .join(' ');
      break;
    }
  }

  return title;
};

export const capitalizeWords = (str: string): string => {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const navigate = (router: Router, route: string): void => {
  router.navigate([route]);
};

export const formatTimestamp = (
  timestamp: Date
): { date: string; time: string } => {
  const d = new Date(timestamp);
  const date = d.toDateString();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format

  const time = `${formattedHours}:${minutes
    .toString()
    .padStart(2, '0')} ${ampm}`;
  return { date, time };
};
