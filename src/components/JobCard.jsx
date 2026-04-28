import { buildJobLinks } from '../utils/gemini'
import styles from './JobCard.module.css'

function ScoreBadge({ score }) {
  const cls = score >= 70 ? styles.scoreHigh : score >= 45 ? styles.scoreMid : styles.scoreLow
  return <span className={`${styles.score} ${cls}`}>{score}%</span>
}

function MetaChip({ children }) {
  return children ? <span className={styles.metaChip}>{children}</span> : null
}

export default function JobCard({ job, index }) {
  const links = buildJobLinks(job.company, job.suggestedRole || 'Frontend Engineer')

  return (
    <div className={styles.card} style={{ animationDelay: `${index * 50}ms` }}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.rank}>#{index + 1}</div>
          <div>
            <div className={styles.company}>{job.company}</div>
            <div className={styles.role}>{job.suggestedRole}</div>
          </div>
        </div>
        <ScoreBadge score={parseInt(job.score) || 0} />
      </div>

      <div className={styles.meta}>
        <MetaChip>{job.category}</MetaChip>
        <MetaChip>{job.type}</MetaChip>
        <MetaChip>{job.remote}</MetaChip>
        {job.salary && (
          <span className={`${styles.metaChip} ${styles.salary}`}>{job.salary}</span>
        )}
      </div>

      {job.reason && (
        <p className={styles.reason}>{job.reason}</p>
      )}

      {(job.matchedTags?.length > 0 || job.missingTags?.length > 0) && (
        <div className={styles.tags}>
          {(job.matchedTags || []).map(t => (
            <span key={t} className={`${styles.tag} ${styles.tagMatch}`}>{t}</span>
          ))}
          {(job.missingTags || []).map(t => (
            <span key={t} className={`${styles.tag} ${styles.tagMissing}`}>{t}</span>
          ))}
        </div>
      )}

      <div className={styles.links}>
        {links.map(l => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  )
}
