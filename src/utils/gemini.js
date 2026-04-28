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
  const q = encodeURIComponent(`${company} ${role}`)
  const co = encodeURIComponent(company)
  const ro = encodeURIComponent(role)
  return [
    {
      label: 'LinkedIn',
      url: `https://www.linkedin.com/jobs/search/?keywords=${q}`,
      icon: 'li',
    },
    {
      label: 'Indeed',
      url: `https://www.indeed.com/jobs?q=${ro}+${co}`,
      icon: 'in',
    },
    {
      label: 'Glassdoor',
      url: `https://www.glassdoor.com/Jobs/index.htm?typedKeyword=${q}`,
      icon: 'gd',
    },
    {
      label: 'Google Jobs',
      url: `https://www.google.com/search?q=${q}+jobs+site:careers.*+OR+site:jobs.*`,
      icon: 'go',
    },
  ]
}
