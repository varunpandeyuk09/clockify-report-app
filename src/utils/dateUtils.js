export function todayISO(timezone = 'Asia/Kolkata') {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
}

export function shiftISO(dateISO, days) {
  const [y, m, d] = dateISO.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

export function tzOffsetString(timezone, dateISO) {
  const noon = new Date(`${dateISO}T12:00:00Z`)
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(dtf.formatToParts(noon).map((p) => [p.type, p.value]))
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  const diff = asUTC - noon.getTime()
  const sign = diff >= 0 ? '+' : '-'
  const abs = Math.abs(diff)
  const hh = String(Math.floor(abs / 3600000)).padStart(2, '0')
  const mm = String(Math.floor((abs % 3600000) / 60000)).padStart(2, '0')
  return `${sign}${hh}:${mm}`
}

export function getDateRange(dateISO, timezone = 'Asia/Kolkata') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) throw new Error('Invalid date. Use YYYY-MM-DD')
  const offset = tzOffsetString(timezone, dateISO)
  const nextDateISO = shiftISO(dateISO, 1)
  const nextOffset = tzOffsetString(timezone, nextDateISO)
  return {
    start: `${dateISO}T00:00:00${offset}`,
    end: `${nextDateISO}T00:00:00${nextOffset}`,
    nextDateISO,
  }
}

function parseInTz(dateISO, timezone) {
  const d = new Date(`${dateISO}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateLong(dateISO, timezone = 'Asia/Kolkata') {
  return parseInTz(dateISO, timezone) || dateISO
}

export function formatDateShort(dateISO, timezone = 'Asia/Kolkata') {
  try {
    const d = new Date(`${dateISO}T12:00:00Z`)
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: '2-digit',
    }).format(d)
  } catch {
    return dateISO
  }
}
