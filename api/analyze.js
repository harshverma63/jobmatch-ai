export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' })

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: err?.error?.message || 'API error' })
    }

    const data = await response.json()

    // Return in Gemini-compatible format so frontend needs no changes
    return res.status(200).json({
      candidates: [{
        content: {
          parts: [{
            text: data.choices?.[0]?.message?.content || ''
          }]
        }
      }]
    })

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}