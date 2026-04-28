import { useState } from 'react'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import { callGemini, safeParseJSON } from '../utils/gemini'
import styles from './JobScorer.module.css'

function ScoreRing({ score }) {
  const radius = 48
  const stroke = 5
  const normalizedRadius = radius - stroke
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(score, 100) / 100) * circumference
  const color = score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className={styles.ringWrap}>
      <svg height={radius * 2} width={radius * 2} className={styles.ring}>
        <circle
          stroke="var(--surface-3)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div className={styles.ringLabel}>
        <span className={styles.ringScore} style={{ color }}>{score}</span>
        <span className={styles.ringUnit}>%</span>
      </div>
    </div>
  )
}

function TagRow({ tag }) {
  const cls =
    tag.status === 'matched' ? styles.tagMatch :
    tag.status === 'partial' ? styles.tagPartial :
    styles.tagMissing
  const label =
    tag.status === 'matched' ? 'Match' :
    tag.status === 'partial' ? 'Partial' : 'Missing'
  return (
    <div className={styles.tagRow}>
      <span className={styles.tagName}>{tag.name}</span>
      <span className={`${styles.tagStatus} ${cls}`}>{label}</span>
    </div>
  )
}

export default function JobScorer() {
  const [jobUrl, setJobUrl] = useState('')
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleRun = async () => {
    setError('')
    setResult(null)
    if (!jobUrl.trim()) { setError('Please enter a job post URL.'); return }
    if (!cvText.trim() || cvText.trim().length < 20) { setError('Please paste your CV text.'); return }

    setLoading(true)

    const prompt = `You are an expert recruiter and CV analyst. Analyze this job post URL and candidate CV to produce a detailed alignment score and breakdown.

JOB POST URL: ${jobUrl.trim()}
(Use the URL to infer: company name, job title, seniority level, likely tech stack, and requirements. Treat it as real.)

CANDIDATE CV:
${cvText.trim().slice(0, 3500)}

ANALYSIS TASKS:
1. Extract company name and job title from the URL
2. Infer the likely tech stack and requirements based on company + role
3. Score the CV match 0-100
4. Estimate salary (INR LPA preferred, fallback to USD)
5. Estimate employment type and remote policy
6. List all key required skills as tags with status: "matched", "partial", or "missing"
7. List top 3 CV strengths for this specific role
8. List top 2 gaps the candidate should address
9. Write a 2-sentence overall fit summary

Return ONLY a valid JSON object, no markdown, no backticks:
{
  "company": "Company Name",
  "role": "Job Title",
  "score": 82,
  "salary": "20-35 LPA",
  "type": "Full-time",
  "remote": "Hybrid",
  "tags": [
    { "name": "React JS", "status": "matched" },
    { "name": "TypeScript", "status": "partial" },
    { "name": "GraphQL", "status": "missing" }
  ],
  "strengths": [
    "7+ years of frontend experience with live React v19 deployments",
    "Strong AI tooling and AI tooling and prompt engineering experience",
    "Proven team leadership and cross-functional collaboration"
  ],
  "gaps": [
    "TypeScript not explicitly mentioned in CV",
    "No GraphQL or Apollo experience visible"
  ],
  "summary": "Strong overall fit with excellent React and modern JavaScript experience. Bridging the TypeScript gap would make this application significantly stronger."
}`

    try {
      const raw = await callGemini(prompt)
      const parsed = safeParseJSON(raw)
      if (!parsed || typeof parsed !== 'object') {
        setError('Could not parse response. Please try again.')
        setLoading(false)
        return
      }
      setResult(parsed)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Job post URL</label>
          <input
            type="url"
            className={styles.input}
            placeholder="https://company.com/jobs/frontend-engineer"
            value={jobUrl}
            onChange={e => setJobUrl(e.target.value)}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Your CV text</label>
          <textarea
            className={styles.textarea}
            placeholder="Paste your full CV / resume text here..."
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            rows={7}
          />
        </div>

        <ErrorMessage message={error} />

        <button
          className={styles.runBtn}
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Score This Job ↗'}
        </button>
      </div>

      {loading && <Loader message="Fetching job details and scoring your CV..." />}

      {!loading && result && (
        <div className={`${styles.resultCard} animate-fade-up`}>
          <div className={styles.resultTop}>
            <div className={styles.jobInfo}>
              <div className={styles.jobCompany}>{result.company}</div>
              <div className={styles.jobRole}>{result.role}</div>
              <div className={styles.jobMeta}>
                {result.salary && <span className={`${styles.chip} ${styles.chipSalary}`}>{result.salary}</span>}
                {result.type && <span className={styles.chip}>{result.type}</span>}
                {result.remote && <span className={styles.chip}>{result.remote}</span>}
              </div>
            </div>
            <ScoreRing score={parseInt(result.score) || 0} />
          </div>

          {result.summary && (
            <p className={styles.summary}>{result.summary}</p>
          )}

          {result.tags?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Skill tag alignment</div>
              <div className={styles.tagList}>
                {result.tags.map((t, i) => <TagRow key={i} tag={t} />)}
              </div>
            </div>
          )}

          <div className={styles.twoCol}>
            {result.strengths?.length > 0 && (
              <div className={styles.box}>
                <div className={`${styles.boxTitle} ${styles.titleGreen}`}>Strengths</div>
                <ul className={styles.list}>
                  {result.strengths.map((s, i) => <li key={i} className={styles.listItem}>{s}</li>)}
                </ul>
              </div>
            )}
            {result.gaps?.length > 0 && (
              <div className={styles.box}>
                <div className={`${styles.boxTitle} ${styles.titleRed}`}>Gaps to address</div>
                <ul className={styles.list}>
                  {result.gaps.map((g, i) => <li key={i} className={styles.listItem}>{g}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
