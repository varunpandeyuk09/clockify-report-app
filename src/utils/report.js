import { formatDateLong, todayISO } from './dateUtils.js'

export function parseDuration(duration) {
  if (!duration) return 0
  const trimmed = String(duration).trim()
  const isNegative = trimmed.startsWith('-')
  const clean = isNegative ? trimmed.slice(1) : trimmed

  const match = clean.match(
    /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/,
  )
  if (!match) return 0

  const days = Number(match[1] || 0)
  const hours = Number(match[2] || 0)
  const minutes = Number(match[3] || 0)
  const seconds = Number(match[4] || 0)
  const total = days * 86400 + hours * 3600 + minutes * 60 + seconds
  return isNegative ? -total : total
}

export function secondsToHours(seconds) {
  return (seconds / 3600).toFixed(2)
}

export function formatHoursPretty(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getDescription(entry) {
  const desc = entry?.description?.trim()
  if (desc) return desc
  if (entry?.project?.name) return entry.project.name
  if (entry?.projectId) return `Project:${entry.projectId.slice(0, 6)}`
  if (entry?.task?.name) return entry.task.name
  return '(No description)'
}

export function computeDurationFromInterval(entry, reportEndIso) {
  const interval = entry?.timeInterval
  if (!interval?.start) return 0

  const parsed = parseDuration(interval.duration)
  if (parsed > 0) return parsed

  try {
    const start = new Date(interval.start)
    let end
    if (interval.end) {
      end = new Date(interval.end)
    } else {
      const now = new Date()
      end = reportEndIso ? new Date(reportEndIso) : now
      if (now < end) end = now
    }
    const diff = (end - start) / 1000
    return diff > 0 ? diff : 0
  } catch {
    return 0
  }
}

export function calculateEntries(entries, reportEndIso) {
  const totals = {}
  let totalSeconds = 0
  let ignoredCount = 0

  for (const entry of entries) {
    const description = getDescription(entry)
    let duration = parseDuration(entry?.timeInterval?.duration)

    if (!Number.isFinite(duration) || duration <= 0) {
      duration = computeDurationFromInterval(entry, reportEndIso)
    }
    if (duration < 0) duration = Math.abs(duration)

    if (!Number.isFinite(duration) || duration <= 0) {
      ignoredCount += 1
      continue
    }

    totals[description] = (totals[description] || 0) + duration
    totalSeconds += duration
  }

  return { totals, totalSeconds, ignoredCount }
}

export function buildMessage(report, timezone = 'Asia/Kolkata') {
  const lines = []
  lines.push('☀️ *Good Morning Everyone!* ☀️')
  lines.push(`🗓️ *${formatDateLong(todayISO(timezone), timezone)}*`)
  lines.push('━━━━━━━━━━━━━━━━━━━━━━')

  if (!report || report.tasks.length === 0) {
    lines.push('😴 *No time entries found for this day.*')
  } else {
    lines.push(`💼 *Work Report for ${report.dateShort}:*`)
    lines.push('')
    for (const task of report.tasks) {
      lines.push(`🔹 *${task.name}*`)
      lines.push(`   ⏱️  ${secondsToHours(task.seconds)} hours  (${formatHoursPretty(task.seconds)})`)
    }
  }

  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━')
  const totalHours = report ? secondsToHours(report.totalSeconds) : '0.00'
  lines.push(`✨ *Total Time:* ⏰ *${totalHours} hours* ✨`)
  if (report && report.totalSeconds > 0) {
    const n = report.tasks.length
    lines.push(`   _(${formatHoursPretty(report.totalSeconds)} • ${n} task${n !== 1 ? 's' : ''})_`)
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('🌸 _Have a wonderful & productive day!_ 🚀')
  return lines.join('\n')
}
