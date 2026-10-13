import Icon from './Icon.jsx'
import CopyButton from './CopyButton.jsx'
import { buildMessage, formatHoursPretty, secondsToHours } from '../utils/report.js'

export default function ReportCard({ report }) {
  const maxSeconds = Math.max(...report.tasks.map((t) => t.seconds), 1)
  const message = buildMessage(report, report.timezone)
  const plainList = report.tasks
    .map((t) => `${t.name}: ${secondsToHours(t.seconds)} hours`)
    .join('\n')

  return (
    <article className="report">
      <header className="report-head">
        <div>
          <span className="pill pill-soft">
            <Icon name="sparkles" size={13} /> Daily report
          </span>
          <h2>{report.dateLong}</h2>
        </div>
        <span className="report-total-badge">
          <Icon name="clock" size={14} /> {report.totalHours}h
        </span>
      </header>

      <div className="summary">
        <div className="summary-cell">
          <span className="summary-value">{report.totalHours}</span>
          <span className="summary-label">Total hours</span>
        </div>
        <div className="summary-cell">
          <span className="summary-value">{report.tasks.length}</span>
          <span className="summary-label">Tasks</span>
        </div>
        <div className="summary-cell">
          <span className="summary-value">{formatHoursPretty(report.totalSeconds)}</span>
          <span className="summary-label">Pretty time</span>
        </div>
      </div>

      <div className="report-greeting">
        ☀️ <strong>Good Morning Everyone!</strong> ☀️
      </div>

      <ul className="task-list">
        {report.tasks.map((task) => {
          const pct = Math.max(4, (task.seconds / maxSeconds) * 100)
          return (
            <li key={task.name} className="task-row">
              <div className="task-top">
                <span className="task-name">{task.name}</span>
                <span className="task-hours">
                  {secondsToHours(task.seconds)}h <small>({formatHoursPretty(task.seconds)})</small>
                </span>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>

      <div className="report-foot">
        <div className="total-line">
          <span className="muted">✨ Total time</span>
          <strong>⏰ {report.totalHours} hours</strong>
        </div>
        <p className="muted total-sub">
          {formatHoursPretty(report.totalSeconds)} • {report.tasks.length} task
          {report.tasks.length !== 1 ? 's' : ''} • 🌸 Have a wonderful &amp; productive day!
        </p>
        {report.ignoredCount > 0 && (
          <p className="muted total-sub">
            ⚠️ {report.ignoredCount} zero/invalid duration entr{report.ignoredCount !== 1 ? 'ies' : 'y'}{' '}
            ignored
          </p>
        )}
      </div>

      <div className="report-actions">
        <CopyButton text={message} label="Copy formatted report" />
        <CopyButton text={plainList} label="Copy plain list" variant="soft" />
      </div>
    </article>
  )
}
