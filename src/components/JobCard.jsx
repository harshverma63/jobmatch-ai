import { useState } from 'react'
import { buildJobLinks } from '../utils/gemini'
import styles from './JobCard.module.css'

function ScoreBadge({ score }) {
  const cls = score >= 70 ? styles.scoreHigh : score >= 45 ? styles.scoreMid : styles.scoreLow
  return <span className={`${styles.score} ${cls}`}>{score}%</span>
}

export default function JobCard({ job, index, onApply, hasApplied }) {
  const [expanded, setExpanded] = useState(false)
  const links = buildJobLinks(job.company, job.suggestedRole || 'Engineer')
  const primaryLinks = links.filter(l => l.primary)
  const secondaryLinks = links.filter(l => !l.primary)
  const applied = hasApplied(job.company, job.suggestedRole)

  const handleApply = () => {
    // Open the best apply link
    const best = primaryLinks[0]
    if (best) window.open(best.url, '_blank', 'noopener,noreferrer')
    onApply(job)
  }

  return (
    <div
      className={`${styles.card} ${applied ? styles.cardApplied : ''}`}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      {/* Top row */}
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.rank}>#{index + 1}</div>
          <div>
            <div className={styles.company}>{job.company}</div>
            <div className={styles.role}>{job.suggestedRole}</div>
          </div>
        </div>
        <div className={styles.topRight}>
          <ScoreBadge score={parseInt(job.score) || 0} />
          {applied && <span className={styles.appliedBadge}>✓ Applied</span>}
        </div>
      </div>

      {/* Meta chips */}
      <div className={styles.meta}>
        {job.category && <span className={styles.metaChip}>{job.category}</span>}
        {job.type && <span className={styles.metaChip}>{job.type}</span>}
        {job.remote && <span className={styles.metaChip}>{job.remote}</span>}
        {job.salary && <span className={`${styles.metaChip} ${styles.salary}`}>{job.salary}</span>}
      </div>

      {/* Match reason */}
      {job.reason && <p className={styles.reason}>{job.reason}</p>}

      {/* Skill tags */}
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

      {/* Accordion — Job Description */}
      <button
        className={styles.accordionBtn}
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <span>Job Description</span>
        <span className={`${styles.accordionIcon} ${expanded ? styles.accordionIconOpen : ''}`}>
          ▾
        </span>
      </button>

      {expanded && (
        <div className={styles.accordionBody}>
          {job.jobDescription ? (
            <p className={styles.jd}>{job.jobDescription}</p>
          ) : (
            <div className={styles.jdSections}>
              {job.responsibilities && (
                <div className={styles.jdSection}>
                  <div className={styles.jdSectionTitle}>Responsibilities</div>
                  <ul className={styles.jdList}>
                    {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {job.requirements && (
                <div className={styles.jdSection}>
                  <div className={styles.jdSectionTitle}>Requirements</div>
                  <ul className={styles.jdList}>
                    {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {!job.responsibilities && !job.requirements && (
                <p className={styles.jdEmpty}>
                  Full job description available on the company's careers page. Click any link below to view.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.applyBtn} ${applied ? styles.applyBtnApplied : ''}`}
          onClick={handleApply}
          disabled={applied}
        >
          {applied ? '✓ Already Applied' : '⚡ Apply Now'}
        </button>
        <div className={styles.links}>
          {secondaryLinks.map(l => (
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
    </div>
  )
}
