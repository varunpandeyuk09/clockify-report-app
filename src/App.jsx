import { useState } from 'react'
import SetupWizard from './components/SetupWizard.jsx'
import Dashboard from './components/Dashboard.jsx'
import { useInstallPrompt, usePWAUpdates } from './pwa.js'

const STORAGE_KEY = 'clockify-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings)
  const [editing, setEditing] = useState(false)
  const { needRefresh, busy, reload, dismiss } = usePWAUpdates()
  const { canInstall, install } = useInstallPrompt()
  const [installDismissed, setInstallDismissed] = useState(
    () => sessionStorage.getItem('install-dismissed') === '1',
  )

  const saveSettings = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage full / private mode — setup still continues for this session
    }
    setSettings(next)
    setEditing(false)
  }

  const onDashboard = Boolean(settings) && !editing
  const showInstall = canInstall && !installDismissed && onDashboard

  const dismissInstall = () => {
    sessionStorage.setItem('install-dismissed', '1')
    setInstallDismissed(true)
  }

  return (
    <div className={onDashboard ? 'app' : 'app app-setup'}>
      {showInstall && (
        <div className="banner">
          <div>
            <strong>Install Clockify Daily Report</strong>
            <p>Home screen se ek tap me daily report — offline app jaisa.</p>
          </div>
          <div className="banner-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={async () => {
                const ok = await install()
                if (ok) dismissInstall()
              }}
            >
              Install
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={dismissInstall}>
              Later
            </button>
          </div>
        </div>
      )}

      {!settings || editing ? (
        <SetupWizard
          initial={settings}
          canCancel={Boolean(settings)}
          onCancel={() => setEditing(false)}
          onSave={saveSettings}
        />
      ) : (
        <Dashboard settings={settings} onOpenSettings={() => setEditing(true)} />
      )}

      {needRefresh && (
        <div className="toast">
          <span>🔄 New version is ready</span>
          <div className="toast-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={reload}
              disabled={busy}
            >
              {busy ? 'Updating…' : 'Reload'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={dismiss}>
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
