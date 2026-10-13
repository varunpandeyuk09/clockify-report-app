import { useState } from 'react'
import SetupWizard from './components/SetupWizard.jsx'
import Dashboard from './components/Dashboard.jsx'

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

  const saveSettings = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage full / private mode — setup still continues for this session
    }
    setSettings(next)
    setEditing(false)
  }

  if (!settings || editing) {
    return (
      <div className="app app-setup">
        <SetupWizard
          initial={settings}
          canCancel={Boolean(settings)}
          onCancel={() => setEditing(false)}
          onSave={saveSettings}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <Dashboard settings={settings} onOpenSettings={() => setEditing(true)} />
    </div>
  )
}
