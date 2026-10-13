import { useCallback, useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import DateBar from './DateBar.jsx'
import ReportCard from './ReportCard.jsx'
import { generateReport } from '../services/generate.js'
import { shiftISO, todayISO } from '../utils/dateUtils.js'

function initialDate(settings) {
  const today = todayISO(settings.timezone)
  if (settings.defaultDay === 'today') return today
  return shiftISO(today, -1)
}

export default function Dashboard({ settings, onOpenSettings, theme, onToggleTheme }) {
  const [dateISO, setDateISO] = useState(() => initialDate(settings))
  const [status, setStatus] = useState('loading')
  const [report, setReport] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const load = useCallback(
    async (date) => {
      setStatus('loading')
      setReport(null)
      setErrorMessage('')
      try {
        const res = await generateReport(settings, date)
        setStatus(res.status)
        setReport(res.report || null)
      } catch (err) {
        setErrorMessage(err?.message || 'Kuch galat ho gaya. Dobara try karo.')
        setStatus('error')
      }
    },
    [settings],
  )

  useEffect(() => {
    load(initialDate(settings))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="clock" size={20} />
          </span>
          <span className="brand-name">
            Clockify Daily Report
            <small>{settings.displayName ? `Hi, ${settings.displayName}` : settings.timezone}</small>
          </span>
        </div>
        <div className="dash-head-actions">
          <span className="status-chip">
            <span className="dot" /> Connected
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Open settings">
            <Icon name="gear" size={19} />
          </button>
        </div>
      </header>

      <DateBar
        dateISO={dateISO}
        timezone={settings.timezone}
        onChange={(d) => {
          setDateISO(d)
          load(d)
        }}
        onFetch={() => load(dateISO)}
        busy={status === 'loading'}
      />

      <section className="dash-body">
        {status === 'loading' && (
          <div className="skeleton-card" aria-hidden="true">
            <div className="sk sk-title" />
            <div className="sk sk-line" />
            <div className="sk sk-line" />
            <div className="sk sk-line short" />
            <div className="sk sk-total" />
          </div>
        )}

        {status === 'error' && (
          <div className="state-card state-error">
            <span className="state-icon">
              <Icon name="alert" size={24} />
            </span>
            <h3>Couldn&apos;t fetch entries</h3>
            <p className="muted">{errorMessage}</p>
            <div className="state-actions">
              <button type="button" className="btn btn-primary" onClick={() => load(dateISO)}>
                <Icon name="refresh" size={16} /> Retry
              </button>
              <button type="button" className="btn btn-ghost" onClick={onOpenSettings}>
                Open settings
              </button>
            </div>
          </div>
        )}

        {status === 'empty' && (
          <div className="state-card state-empty">
            <span className="state-icon">
              <Icon name="inbox" size={24} />
            </span>
            <h3>No time entries found</h3>
            <p className="muted">
              Clockify par is date ki koi entry nahi mili. Koi aur date try karo ya Today /
              Yesterday chip se check karo.
            </p>
            <div className="state-actions">
              <button type="button" className="btn btn-primary" onClick={() => load(dateISO)}>
                <Icon name="refresh" size={16} /> Refresh
              </button>
            </div>
          </div>
        )}

        {status === 'ready' && report && <ReportCard report={report} />}
      </section>
    </div>
  )
}
