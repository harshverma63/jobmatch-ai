import styles from './ApplicationHistory.module.css'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ApplicationHistory({ applications, onRemove, onClearAll, onClose }) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Application History</div>
            <div className={styles.sub}>{applications.length} job{applications.length !== 1 ? 's' : ''} applied</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {applications.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <p>No applications yet.</p>
            <p>Click "Apply Now" on any job to track it here.</p>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {applications.map(app => (
                <div key={app.id} className={styles.item}>
                  <div className={styles.itemTop}>
                    <div>
                      <div className={styles.itemCompany}>{app.company}</div>
                      <div className={styles.itemRole}>{app.suggestedRole}</div>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => onRemove(app.id)}
                      aria-label="Remove"
                    >✕</button>
                  </div>
                  <div className={styles.itemMeta}>
                    {app.category && <span className={styles.chip}>{app.category}</span>}
                    {app.salary && <span className={`${styles.chip} ${styles.chipSalary}`}>{app.salary}</span>}
                    {app.score && <span className={styles.chip}>{app.score}% match</span>}
                  </div>
                  <div className={styles.itemDate}>Applied on {formatDate(app.appliedAt)}</div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <button className={styles.clearBtn} onClick={onClearAll}>
                🗑 Clear all history
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
