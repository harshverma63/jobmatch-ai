import { useState, useEffect } from 'react'

const STORAGE_KEY = 'jobmatch_applications'

export function useApplicationHistory() {
  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
    } catch {}
  }, [applications])

  const markApplied = (job) => {
    setApplications(prev => {
      const exists = prev.find(a => a.company === job.company && a.suggestedRole === job.suggestedRole)
      if (exists) return prev
      return [
        {
          id: `${job.company}-${Date.now()}`,
          company: job.company,
          suggestedRole: job.suggestedRole,
          category: job.category,
          salary: job.salary,
          score: job.score,
          appliedAt: new Date().toISOString(),
          applyUrl: job.applyUrl || null,
        },
        ...prev,
      ]
    })
  }

  const removeApplication = (id) => {
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  const clearAll = () => setApplications([])

  const hasApplied = (company, role) =>
    applications.some(a => a.company === company && a.suggestedRole === role)

  return { applications, markApplied, removeApplication, clearAll, hasApplied }
}
