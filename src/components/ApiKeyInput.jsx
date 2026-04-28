import { useState } from 'react'
import styles from './ApiKeyInput.module.css'

export default function ApiKeyInput({ value, onChange }) {
  const [show, setShow] = useState(false)

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <div className={styles.keyIcon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
          </svg>
        </div>
        <input
          type={show ? 'text' : 'password'}
          className={styles.input}
          placeholder="Paste your Gemini API key (AIza...)"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="button" className={styles.toggleBtn} onClick={() => setShow(s => !s)}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className={styles.hint}>
        Free key at{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
          aistudio.google.com/apikey
        </a>{' '}
        — 15 req/min, 1M tokens/day
      </p>
    </div>
  )
}
