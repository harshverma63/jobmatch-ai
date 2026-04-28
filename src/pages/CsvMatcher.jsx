import { useState, useRef } from 'react'
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

export default function CsvMatcher({ onApply, hasApplied }) {
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
        cvContentRef.current = `[PDF: ${file.name} — paste CV text below for best results]`
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
      : 'any type — startups, big tech, FAANG, all welcome'

    const csvPreview = csvContentRef.current.slice(0, 12000)
    const cvPreview = finalCv.slice(0, 3500)
    const targetRole = role.trim() || 'Frontend Engineer / React Developer'

    const prompt = `You are an expert job-matching AI. Analyze a company list CSV and a candidate CV, return the best-matched companies ranked by alignment score.

CANDIDATE CV:
${cvPreview}

TARGET ROLE: ${targetRole}
PREFERRED CATEGORIES: ${catFilter}

COMPANY LIST CSV:
${csvPreview}

INSTRUCTIONS:
1. Parse ALL company names from the CSV (columns may be named: Company, Name, Organization, Startup, etc.)
2. Identify each company's industry/category
3. Filter by category if specified
4. Score each company 0-100 for likelihood of hiring this candidate
5. Suggest the best-fit job title for this candidate at each company
6. Estimate salary in INR LPA (candidate is based in India)
7. Estimate employment type: Full-time / Part-time / Contract
8. Estimate remote policy: Remote / Hybrid / On-site
9. List 3-5 matched skill tags from the CV
10. List 1-2 missing skill tags (gaps)
11. Write 2-3 bullet points as jobDescription explaining what this role likely involves at this company
12. Write a one-sentence reason explaining why this is a match
13. Return TOP 50 results sorted by score descending

Return ONLY a valid JSON array. No markdown, no explanation, no backticks:

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
    "reason": "Strong React and AI tooling experience aligns with their product engineering team.",
    "jobDescription": "Build and maintain React-based frontend applications. Collaborate with product and design teams. Integrate REST APIs and optimize for performance and accessibility."
  }
]`

    try {
      const raw = await callGemini(prompt)
      const parsed = safeParseJSON(raw)
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
        setError('Could not parse response. Try again or check your CSV has a company name column.')
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

        <button className={styles.runBtn} onClick={handleRun} disabled={loading}>
          {loading ? 'Analyzing...' : 'Find Matching Jobs ↗'}
        </button>
      </div>

      {loading && <Loader message="Scanning company list and matching with your CV..." />}

      {!loading && jobs.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsTitle}>{jobs.length} matching companies found</div>
            <div className={styles.resultsSub}>Sorted by CV alignment — click Job Description to expand details · Apply Now opens the best job link</div>
          </div>
          <div className={styles.jobsList}>
            {jobs.map((job, i) => (
              <JobCard
                key={`${job.company}-${i}`}
                job={job}
                index={i}
                onApply={onApply}
                hasApplied={hasApplied}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
