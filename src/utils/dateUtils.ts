const FILE_SAFE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

/**
 * Timestamp for logs, report folders, and screenshot names.
 * Example: 2026-06-03_14-30-05
 */
export function formatTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', FILE_SAFE_FORMAT)
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}-${parts.second}`;
}

/** ISO date (YYYY-MM-DD) for data-driven tests and API payloads. */
export function todayIsoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
