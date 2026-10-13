import { useState } from 'react'
import Icon from './Icon.jsx'
import { autoDetect, getMe } from '../services/clockify.js'

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
]

const DEFAULT_FORM = {
  apiKey: '',
  workspaceId: '',
  userId: '',
  timezone: 'Asia/Kolkata',
  displayName: '',
  defaultDay: 'today',
  workdaysOnly: true,
  theme: 'dark',
}

const STEPS = [
  { title: 'API access', sub: 'Connect your Clockify account', icon: 'key' },
  { title: 'Workspace', sub: 'IDs + timezone', icon: 'globe' },
  { title: 'Preferences', sub: 'Report defaults', icon: 'sparkles' },
]

function mergeInitial(initial) {
  if (!initial) return DEFAULT_FORM
  return { ...DEFAULT_FORM, ...initial }
}

export default function SetupWizard({ initial, canCancel, onCancel, onSave }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [touched, setTouched] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState('')
  const [form, setForm] = useState(() => mergeInitial(initial))

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  const keyOk = form.apiKey.trim().length >= 10
  const idsOk = form.workspaceId.trim().length > 0 && form.userId.trim().length > 0
  const stepValid = step === 0 ? keyOk : step === 1 ? idsOk : true

  const goNext = async () => {
    if (!stepValid) {
      setTouched(true)
      return
    }
    if (step === 0) {
      setBusy(true)
      setVerifyError('')
      try {
        await getMe(form.apiKey.trim())
        setStep(1)
        setTouched(false)
      } catch (err) {
        setVerifyError(err?.message || 'API key verify nahi ho payi.')
      } finally {
        setBusy(false)
      }
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    setTouched(false)
  }

  const runAutoDetect = async () => {
    setDetecting(true)
    setDetectError('')
    try {
      const ids = await autoDetect(form.apiKey.trim())
      set(ids)
    } catch (err) {
      setDetectError(err?.message || 'Auto-detect fail ho gaya.')
    } finally {
      setDetecting(false)
    }
  }

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0))
    setTouched(false)
  }

  const finish = () => {
    setDone(true)
  }

  const launch = () => onSave({ ...form, apiKey: form.apiKey.trim() })

  if (done) {
    return (
      <div className="wizard wizard-done">
        <div className="done-badge">
          <span className="done-ring">
            <Icon name="check" size={34} />
          </span>
        </div>
        <h1>You&apos;re all set!</h1>
        <p className="muted">
          Setup saved. Apna pehla daily report generate karne ke liye dashboard kholo.
        </p>
        <div className="done-summary">
          <div className="done-row">
            <span className="muted">Timezone</span>
            <strong>{form.timezone}</strong>
          </div>
          <div className="done-row">
            <span className="muted">Default report</span>
            <strong>
              {form.defaultDay === 'today'
                ? 'Today'
                : form.defaultDay === 'auto'
                  ? 'Last working day'
                  : 'Yesterday'}
            </strong>
          </div>
          <div className="done-row">
            <span className="muted">Workdays only</span>
            <strong>{form.workdaysOnly ? 'On' : 'Off'}</strong>
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={launch}>
          Open dashboard <Icon name="arrowRight" size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="wizard">
      <header className="wizard-head">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="clock" size={22} />
          </span>
          <span className="brand-name">Clockify Daily Report</span>
        </div>
        {canCancel && (
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Close setup">
            <Icon name="close" size={18} />
          </button>
        )}
      </header>

      <div className="wizard-intro">
        <span className="pill">
          <Icon name="sparkles" size={13} /> First-time setup
        </span>
        <h1>Chalo report ready karte hain</h1>
        <p className="muted">
          3 quick steps — sirf ek baar. Sab kuch sirf is device par save hota hai.
        </p>
      </div>

      <ol className="stepper" aria-label="Setup progress">
        {STEPS.map((s, i) => (
          <li key={s.title} className={`step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
            <button type="button" className="step-btn" onClick={() => i < step && setStep(i)} disabled={i > step}>
              <span className="step-dot">{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
              <span className="step-meta">
                <strong>{s.title}</strong>
                <small>{s.sub}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <section className="panel">
        {step === 0 && (
          <div className="wizard-body">
            <h2>
              <Icon name="key" size={17} /> Clockify API key
            </h2>
            <p className="muted">
              Key sirf aapke browser me rehti hai, kahi server par nahi jaati. Neeche steps dekho
              kaise generate karni hai.
            </p>

            <label className="field">
              <span className="label">API key</span>
              <div className="input-wrap">
                <input
                  type={reveal ? 'text' : 'password'}
                  className="input mono"
                  placeholder="nmcd5u0h0k...xxxxxxxxxxxx"
                  value={form.apiKey}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => set({ apiKey: e.target.value })}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setReveal((v) => !v)}
                  aria-label={reveal ? 'Hide key' : 'Show key'}
                >
                  <Icon name={reveal ? 'eyeOff' : 'eye'} size={17} />
                </button>
              </div>
              {touched && !keyOk && <span className="hint hint-err">API key kam se kam 10 characters ki honi chahiye.</span>}
              {!touched && keyOk && !verifyError && <span className="hint hint-ok">Ready — Continue dabao, key verify ho jayegi</span>}
              {verifyError && <span className="hint hint-err">{verifyError}</span>}
            </label>

            <div className="info-card">
              <Icon name="sparkles" size={16} />
              <div>
                <strong>API key kaise milegi?</strong>
                <p className="muted">
                  Clockify me <strong>profile icon</strong> pe click → <strong>Preferences</strong>{' '}
                  → <strong>Advanced</strong> tab → <strong>Manage API keys</strong> →{' '}
                  <strong>Generate new</strong> CTA → <strong>Generate</strong> → key copy karke
                  yahan paste karo.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="wizard-body">
            <h2>
              <Icon name="globe" size={17} /> Workspace details
            </h2>
            <p className="muted">
              Ye dono ID Clockify se auto-fetch ho sakti hain — API key verified hai to ek click.
            </p>

            <button
              type="button"
              className="btn btn-soft btn-block"
              onClick={runAutoDetect}
              disabled={detecting}
            >
              {detecting ? (
                <>
                  <span className="spinner spinner-soft" /> Detecting…
                </>
              ) : (
                <>
                  <Icon name="bolt" size={16} /> Auto-detect from API key
                </>
              )}
            </button>
            {detectError && <span className="hint hint-err">{detectError}</span>}

            <label className="field">
              <span className="label">Workspace ID</span>
              <input
                className="input mono"
                placeholder="65f1c2a9b4e0f1a2c3d4e5f6"
                value={form.workspaceId}
                spellCheck={false}
                onChange={(e) => set({ workspaceId: e.target.value })}
              />
            </label>

            <label className="field">
              <span className="label">User ID</span>
              <input
                className="input mono"
                placeholder="6417d9e8f0a1b2c3d4e5f6a7"
                value={form.userId}
                spellCheck={false}
                onChange={(e) => set({ userId: e.target.value })}
              />
              {touched && !idsOk && <span className="hint hint-err">Dono IDs zaroori hain.</span>}
            </label>

            <div className="grid-2">
              <label className="field">
                <span className="label">Timezone</span>
                <select className="input" value={form.timezone} onChange={(e) => set({ timezone: e.target.value })}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="label">Your name (optional)</span>
                <input
                  className="input"
                  placeholder="e.g. Varun"
                  value={form.displayName}
                  onChange={(e) => set({ displayName: e.target.value })}
                />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-body">
            <h2>
              <Icon name="sparkles" size={17} /> Report preferences
            </h2>
            <p className="muted">Ye defaults baad me Settings se kabhi bhi change ho sakte hain.</p>

            <div className="field">
              <span className="label">Report day by default</span>
              <div className="seg" role="tablist">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'auto', label: 'Last working day' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={form.defaultDay === opt.id}
                    className={`seg-btn ${form.defaultDay === opt.id ? 'is-active' : ''}`}
                    onClick={() => set({ defaultDay: opt.id })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="toggle-row">
              <div>
                <strong>Skip weekends</strong>
                <p className="muted">Sat/Sun ko report search me ignore kare.</p>
              </div>
              <button
                type="button"
                className={`switch ${form.workdaysOnly ? 'is-on' : ''}`}
                role="switch"
                aria-checked={form.workdaysOnly}
                onClick={() => set({ workdaysOnly: !form.workdaysOnly })}
              >
                <span className="knob" />
              </button>
            </div>

            <div className="field">
              <span className="label">Theme</span>
              <div className="seg" role="tablist">
                {[
                  { id: 'dark', label: '🌙 Dark' },
                  { id: 'light', label: '☀️ Light' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={form.theme === opt.id}
                    className={`seg-btn ${form.theme === opt.id ? 'is-active' : ''}`}
                    onClick={() => {
                      set({ theme: opt.id })
                      // live preview while choosing; saved only on Complete setup
                      document.documentElement.dataset.theme = opt.id
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="info-card">
              <Icon name="clock" size={16} />
              <div>
                <strong>Ready to generate</strong>
                <p className="muted">
                  Setup ke baad dashboard par date daal kar report generate karoge — formatted output
                  ek tap me copy ho jayegi.
                </p>
              </div>
            </div>
          </div>
        )}

        <footer className="wizard-foot">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={goBack}
            disabled={step === 0 || busy}
          >
            <Icon name="left" size={16} /> Back
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={step === STEPS.length - 1 ? finish : goNext}
            disabled={busy}
          >
            {busy ? (
              <span className="spinner" />
            ) : step === 0 ? (
              <>
                Verify & continue <Icon name="arrowRight" size={16} />
              </>
            ) : step === STEPS.length - 1 ? (
              <>
                Complete setup <Icon name="check" size={16} />
              </>
            ) : (
              <>
                Continue <Icon name="arrowRight" size={16} />
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  )
}
