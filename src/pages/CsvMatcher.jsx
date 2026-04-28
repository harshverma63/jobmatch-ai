import { useState, useRef } from 'react'
import Papa from 'papaparse'
import UploadZone from '../components/UploadZone'
import CategoryFilter from '../components/CategoryFilter'
import JobCard from '../components/JobCard'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import { callGemini, safeParseJSON } from '../utils/gemini'
import styles from './CsvMatcher.module.css'

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export default function CsvMatcher() {
  const [csvFile, setCsvFile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [cvText, setCvText] = useState('')
  const [role, setRole] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState([])
  const csvContentRef = useRef('')
  const cvContentRef = useRef('')

  const handleCsvFile = async (file) => {
    setCsvFile(file)
    setError('')
    try {
      const text = await readFileAsText(file)
      csvContentRef.current = text
    } catch {
      setError('Could not read CSV file. Make sure it is a valid .csv or .txt file.')
    }
  }

  const handleCvFile = async (file) => {
    setCvFile(file)
    setError('')
    try {
      if (file.type === 'application/pdf') {
        cvContentRef.current = `[PDF uploaded: ${file.name} — please also paste CV text below for best results]`
      } else {
        const text = await readFileAsText(file)
        cvContentRef.current = text
        setCvText(text)
      }
    } catch {
      setError('Could not read CV file.')
    }
  }

  const handleRun = async () => {
    setError('')
    if (!csvContentRef.current) { setError('Please upload a company list CSV file.'); return }
    const finalCv = cvText.trim() || cvContentRef.current
    if (!finalCv || finalCv.length < 20) { setError('Please upload or paste your CV text.'); return }

    setLoading(true)
    setJobs([])

    const catFilter = categories.length > 0 && !categories.includes('Any')
      ? categories.join(', ')
      : 'any type (startup, big tech, FAANG — all are welcome)'

    const csvPreview = csvContentRef.current.slice(0, 9000)
    const cvPreview = finalCv.slice(0, 3500)
    const targetRole = role.trim() || 'Frontend Engineer / React Developer'

    const prompt = `You are an expert job-matching AI. Your task is to analyze a company list and a candidate's CV, then return the best-matched companies sorted by alignment score.

CANDIDATE CV:
${cvPreview}

TARGET ROLE: ${targetRole}
PREFERRED COMPANY CATEGORIES: ${catFilter}

COMPANY LIST (CSV DATA):
${csvPreview}

TASK:
1. Parse the CSV and extract all company names (look for columns like "Company", "Name", "Organization", "Startup" etc.)
2. For each company, determine its industry/category based on its name or any description in the CSV
3. If category filter is specified (not "any"), include only companies that match
4. Score each company 0-100 for likelihood of hiring this candidate for the target role
5. Suggest the most fitting job title at that company for this candidate
6. Estimate salary range (INR lakhs per annum preferred since candidate is in India, or USD if unknown)
7. Estimate employment type: Full-time / Part-time / Contract
8. Estimate remote policy: Remote / Hybrid / On-site
9. List 3-5 CV skill tags that match the likely role requirements (matchedTags)
10. List 1-2 skill gaps (missingTags) — skills common for the role not visible in CV
11. Write one sentence explaining WHY this is a match
12. Return TOP 15 results sorted by score descending

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation, no backticks.

[
  {
    "company": "Company Name",
    "category": "SaaS",
    "score": 87,
    "suggestedRole": "Senior Frontend Engineer",
    "salary": "18-28 LPA",
    "type": "Full-time",
    "remote": "Hybrid",
    "matchedTags": ["React JS", "REST API", "Responsive Design", "Figma", "JavaScript ES6+"],
    "missingTags": ["TypeScript"],
    "reason": "Strong React and AI tooling experience aligns with their product engineering team."
  }
]`

    try {
      const raw = await callGemini(prompt)
      const parsed = safeParseJSON(raw)
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
        setError('Gemini returned an unexpected response. Try again or check your CSV format — make sure it has a company name column.')
        setLoading(false)
        return
      }
      setJobs(parsed)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>

        <div className={styles.uploadGrid}>
          <UploadZone
            label="Company list"
            accept=".csv,.txt,.xlsx"
            fileName={csvFile?.name}
            onFile={handleCsvFile}
            icon="📄"
            hint="CSV, TXT — any company list"
          />
          <UploadZone
            label="Your CV"
            accept=".pdf,.txt,.doc,.docx"
            fileName={cvFile?.name}
            onFile={handleCvFile}
            icon="📋"
            hint="PDF, TXT, DOC"
          />
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>
            Paste CV text <span className={styles.optional}>(recommended for best results)</span>
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Paste your full CV / resume text here for the most accurate analysis..."
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            rows={5}
          />
        </div>

        <div className={styles.section}>
          <CategoryFilter selected={categories} onChange={setCategories} />
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Target role <span className={styles.optional}>(optional)</span></label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. Frontend Engineer, React Developer, UI Engineer..."
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>

        <ErrorMessage message={error} />

        <button
          className={styles.runBtn}
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Find Matching Jobs ↗'}
        </button>
      </div>

      {loading && <Loader message="Reading company list and matching with your CV..." />}

      {!loading && jobs.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsTitle}>
              {jobs.length} matching companies found
            </div>
            <div className={styles.resultsSub}>Sorted by CV alignment score — highest first</div>
          </div>
          <div className={styles.jobsList}>
            {jobs.map((job, i) => (
              <JobCard key={`${job.company}-${i}`} job={job} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
