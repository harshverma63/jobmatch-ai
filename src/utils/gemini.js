export async function callGemini(prompt) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `API error ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export function safeParseJSON(text) {
  if (!text) return null
  try {
    // 1. Try direct parse first
    const direct = JSON.parse(text.trim())
    // If wrapped object with a results/jobs/data key, unwrap it
    if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
      const key = Object.keys(direct)[0]
      const val = direct[key]
      if (Array.isArray(val)) return val
      return direct
    }
    return direct
  } catch {}

  try {
    // 2. Strip markdown fences
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    const cleaned = fenced ? fenced[1].trim() : text.trim()

    // 3. Try to find JSON array
    const arrMatch = cleaned.match(/(\[[\s\S]*\])/)
    if (arrMatch) return JSON.parse(arrMatch[1])

    // 4. Try to find JSON object
    const objMatch = cleaned.match(/(\{[\s\S]*\})/)
    if (objMatch) {
      const parsed = JSON.parse(objMatch[1])
      // Unwrap if needed
      if (Array.isArray(parsed)) return parsed
      const key = Object.keys(parsed)[0]
      if (Array.isArray(parsed[key])) return parsed[key]
      return parsed
    }
  } catch {}

  return null
}

export function buildJobLinks(company, role) {
  const companyClean = company.trim()
  const roleClean = role.trim()
  const q = encodeURIComponent(`${companyClean} ${roleClean}`)
  const co = encodeURIComponent(companyClean)
  const ro = encodeURIComponent(roleClean)

  return [
    {
      label: 'Apply on LinkedIn',
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(roleClean + ' ' + companyClean)}&sortBy=DD`,
      primary: true,
    },
    {
      label: 'Google Jobs',
      url: `https://www.google.com/search?q=${encodeURIComponent(companyClean + ' ' + roleClean + ' job opening')}&ibp=htl;jobs`,
      primary: true,
    },
    {
      label: 'Wellfound',
      url: `https://wellfound.com/jobs?q=${ro}&company=${co}`,
      primary: false,
    },
    {
      label: 'Indeed',
      url: `https://www.indeed.com/jobs?q=${encodeURIComponent('"' + companyClean + '" ' + roleClean)}&sort=date`,
      primary: false,
    },
    {
      label: 'Glassdoor',
      url: `https://www.glassdoor.com/Job/jobs.htm?typedKeyword=${q}`,
      primary: false,
    },
    {
      label: 'Official Careers',
      url: `https://www.google.com/search?q=${encodeURIComponent(companyClean + ' careers ' + roleClean + ' apply')}`,
      primary: false,
    },
  ]
}
