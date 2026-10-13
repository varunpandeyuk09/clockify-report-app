import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

export default function CopyButton({ text, label = 'Copy report', variant = 'primary' }) {
  const [state, setState] = useState('idle')
  const timer = useRef(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        ok = true
      }
    } catch {
      ok = false
    }
    if (!ok) {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
      document.body.removeChild(ta)
    }
    setState(ok ? 'copied' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 1800)
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
