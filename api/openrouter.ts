// Use a private environment variable (not VITE_)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed', data: null });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ success: false, error: 'OpenRouter API key not configured', data: null });
  }

  const { prompt, temperature = 0.8, max_tokens = 2000 } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Missing prompt', data: null });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-recipe-finder.vercel.app',
        'X-Title': 'AI Recipe Finder & Meal Planner',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ success: false, error: errorText, data: null });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data, error: null });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error), data: null });
  }
} 