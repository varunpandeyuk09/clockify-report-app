import Icon from './Icon.jsx'
import { shiftISO, todayISO } from '../utils/dateUtils.js'

export default function DateBar({ dateISO, timezone, onChange, onFetch, busy }) {
  const today = todayISO(timezone)
  const isToday = dateISO === today
  const isYesterday = dateISO === shiftISO(today, -1)

  return (
    <section className="datebar">
      <div className="datebar-top">
        <span className="label">
          <Icon name="calendar" size={13} /> Report date
        </span>
        <div className="chips">
          <button
            type="button"
            className={`chip ${isYesterday ? 'is-active' : ''}`}
            onClick={() => onChange(shiftISO(today, -1))}
          >
            Yesterday
          </button>
          <button
            type="button"
            className={`chip ${isToday ? 'is-active' : ''}`}
            onClick={() => onChange(today)}
          >
            Today
          </button>
        </div>
      </div>

      <div className="datebar-row">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onChange(shiftISO(dateISO, -1))}
          aria-label="Previous day"
        >
          <Icon name="left" size={18} />
        </button>

        <label className="date-field">
          <input
            type="date"
            className="date-input"
            value={dateISO}
            max={today}
            onChange={(e) => e.target.value && onChange(e.target.value)}
          />
          <span className="date-fake">
            <Icon name="calendar" size={16} />
            {dateISO}
          </span>
        </label>

        <button
          type="button"
          className="icon-btn"
          onClick={() => onChange(shiftISO(dateISO, 1))}
          disabled={isToday}
          aria-label="Next day"
        >
          <Icon name="right" size={18} />
        </button>
      </div>

      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onFetch} disabled={busy}>
        {busy ? (
          <>
            <span className="spinner" /> Fetching entries…
          </>
        ) : (
          <>
            <Icon name="bolt" size={17} /> Generate report
          </>
        )}
      </button>
    </section>
  )
}
