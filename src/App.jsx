import { useEffect, useState } from 'react'
import SetupWizard from './components/SetupWizard.jsx'
import Dashboard from './components/Dashboard.jsx'
import { useInstallPrompt, usePWAUpdates } from './pwa.js'

const STORAGE_KEY = 'clockify-settings'

// Bump this on every rollout that should reset saved preferences.
// v2: default report day changed to Today.
const SETTINGS_VERSION = 2

const DEFAULT_PREFS = {
  defaultDay: 'today',
  workdaysOnly: true,
  theme: 'dark',
  displayName: '',
}

// API/account cheezein hamesha preserve hoti hain; sirf preferences reset hoti hain.
function migrateSettings(parsed) {
  if (!parsed || typeof parsed !== 'object') return null
  if ((parsed.version || 1) >= SETTINGS_VERSION) return parsed
  return {
    version: SETTINGS_VERSION,
    apiKey: parsed.apiKey || '',
    workspaceId: parsed.workspaceId || '',
    userId: parsed.userId || '',
    timezone: parsed.timezone || 'Asia/Kolkata',
    ...DEFAULT_PREFS,
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const migrated = migrateSettings(parsed)
    if (!migrated) return null
    if ((parsed.version || 1) < SETTINGS_VERSION) {
      // write back once so migration runs a single time per device
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    }
    return migrated
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
    const withVersion = { version: SETTINGS_VERSION, ...next }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withVersion))
    } catch {
      // storage full / private mode — setup still continues for this session
    }
    setSettings(withVersion)
    setEditing(false)
  }

  const onDashboard = Boolean(settings) && !editing
  const showInstall = canInstall && !installDismissed && onDashboard
  const theme = settings?.theme === 'light' ? 'light' : 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    if (!settings) return
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    const next = { ...settings, theme: nextTheme }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage full / private mode — theme still applies this session
    }
    setSettings(next)
  }

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
          onCancel={() => {
            document.documentElement.dataset.theme = theme
            setEditing(false)
          }}
          onSave={saveSettings}
        />
      ) : (
        <Dashboard
          settings={settings}
          onOpenSettings={() => setEditing(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
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
