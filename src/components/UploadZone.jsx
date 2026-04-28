import { useRef } from 'react'
import styles from './UploadZone.module.css'

export default function UploadZone({ label, accept, fileName, onFile, icon, hint }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={`${styles.zone} ${fileName ? styles.zoneActive : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label={`Upload ${label}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className={styles.hiddenInput}
          aria-hidden="true"
        />
        <div className={styles.iconWrap}>{icon}</div>
        {fileName ? (
          <div className={styles.fileName}>
            <span className={styles.fileNameText}>{fileName}</span>
            <span className={styles.changeHint}>Click to change</span>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.browse}>Browse</span>
            <span className={styles.or}> or drop file here</span>
            {hint && <div className={styles.hint}>{hint}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
