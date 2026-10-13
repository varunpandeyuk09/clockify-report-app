import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

export default function CopyButton({ text, label = 'Copy report', variant = 'primary' }) {
  const [state, setState] = useState('idle')
  const timer = useRef(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const writeClipboard = async (value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
        return true
      }
    } catch {
      // fall through to execCommand
    }
    const ta = document.createElement('textarea')
    ta.value = value
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(ta)
    return ok
  }

  const copy = () => {
    // Native share sheet (Android/iOS) — gesture context me call hona chahiye,
    // isliye clipboard await se pehle hi trigger kar dete hain.
    if (typeof navigator.share === 'function') {
      navigator.share({ text }).catch(() => {
        // user closed the share sheet — ignore
      })
    }
    writeClipboard(text).then((ok) => {
      setState(ok ? 'copied' : 'failed')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setState('idle'), 1800)
    })
  }

  return (
    <button type="button" className={`btn btn-${variant} copy-btn ${state}`} onClick={copy}>
      {state === 'copied' ? (
        <>
          <Icon name="check" size={16} /> Copied!
        </>
      ) : state === 'failed' ? (
        <>Copy failed</>
      ) : (
        <>
          <Icon name="copy" size={16} /> {label}
        </>
      )}
    </button>
  )
}
