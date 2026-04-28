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
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    const cleaned = fenced ? fenced[1] : text
    const arrMatch = cleaned.match(/(\[[\s\S]*\])/)
    const objMatch = cleaned.match(/(\{[\s\S]*\})/)
    const candidate = arrMatch?.[1] || objMatch?.[1] || cleaned
    return JSON.parse(candidate.trim())
  } catch {
    return null
  }
}

export function buildJobLinks(company, role) {
  const companyClean = company.trim()
  const roleClean = role.trim()
  const q = encodeURIComponent(`${companyClean} ${roleClean}`)
  const co = encodeURIComponent(companyClean)
  const ro = encodeURIComponent(roleClean)
  const slug = companyClean.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')

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
