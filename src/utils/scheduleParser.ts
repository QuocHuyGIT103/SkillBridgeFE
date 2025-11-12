export interface ParsedSchedule {
  days: number[];
  startTime?: string;
  endTime?: string;
}

const DAY_MAP: Record<string, number> = {
  'chủ nhật': 0,
  'cn': 0,
  'sunday': 0,
  'thứ hai': 1,
  'thứ 2': 1,
  't2': 1,
  'monday': 1,
  'thứ ba': 2,
  'thứ 3': 2,
  't3': 2,
  'tuesday': 2,
  'thứ tư': 3,
  'thứ 4': 3,
  't4': 3,
  'wednesday': 3,
  'thứ năm': 4,
  'thứ 5': 4,
  't5': 4,
  'thursday': 4,
  'thứ sáu': 5,
  'thứ 6': 5,
  't6': 5,
  'friday': 5,
  'thứ bảy': 6,
  'thứ 7': 6,
  't7': 6,
  'saturday': 6,
};

/**
 * Parse a human readable schedule string (e.g. "Thứ 2, Thứ 4 từ 19:00-21:00")
 * into structured data that can be used to pre-fill forms.
 */
export const parseScheduleFromString = (scheduleStr?: string): ParsedSchedule => {
  if (!scheduleStr) {
    return { days: [] };
  }

  const days: number[] = [];
  let startTime: string | undefined;
  let endTime: string | undefined;
  const lowerStr = scheduleStr.toLowerCase();

  // Try to capture times written in various formats
  const patterns = [
    /(\d{1,2}:\d{2})\s*[\-–—]\s*(\d{1,2}:\d{2})/, // "19:00-21:00" or "19:00–21:00"
    /từ\s*(\d{1,2}:\d{2})\s*(?:đến|\-|–|—|tới|to)\s*(\d{1,2}:\d{2})/, // "từ 19:00 đến 21:00"
    /\((\d{1,2}:\d{2})\s*[\-–—]\s*(\d{1,2}:\d{2})\)/, // "(19:00 - 21:00)"
  ];

  for (const pattern of patterns) {
    const match = lowerStr.match(pattern);
    if (match) {
      startTime = normalizeTime(match[1]);
      endTime = normalizeTime(match[2]);
      break;
    }
  }

  // Parse weekday names/abbreviations
  Object.keys(DAY_MAP).forEach((key) => {
    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerStr)) {
      const dayValue = DAY_MAP[key];
      if (!days.includes(dayValue)) {
        days.push(dayValue);
      }
    }
  });

  return {
    days: days.sort(),
    startTime,
    endTime,
  };
};

const normalizeTime = (value: string): string => {
  const [hour, minute] = value.split(':');
  if (!hour || !minute) {
    return value;
  }

  const normalizedHour = hour.padStart(2, '0');
  return `${normalizedHour}:${minute}`;
};
