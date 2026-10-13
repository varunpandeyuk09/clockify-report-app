import { getTimeEntries } from './clockify.js'
import { formatDateLong, formatDateShort, getDateRange } from '../utils/dateUtils.js'
import { calculateEntries, secondsToHours } from '../utils/report.js'

export async function generateReport(settings, dateISO) {
  const timezone = settings.timezone || 'Asia/Kolkata'
  const { start, end } = getDateRange(dateISO, timezone)

  const entries = await getTimeEntries(settings, start, end)
  const { totals, totalSeconds, ignoredCount } = calculateEntries(entries, end)

  if (!entries.length || totalSeconds <= 0) {
    return { status: 'empty' }
  }

  const tasks = Object.entries(totals)
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((a, b) => b.seconds - a.seconds)

  return {
    status: 'ready',
    report: {
      dateISO,
      timezone,
      dateLong: formatDateLong(dateISO, timezone),
      dateShort: formatDateShort(dateISO, timezone),
      tasks,
      totalSeconds,
      totalHours: secondsToHours(totalSeconds),
      ignoredCount,
    },
  }
}
