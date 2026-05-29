import { NextResponse } from 'next/server'

/**
 * ──────────────────────────────────────────────────────────────
 *  AI Integration Stub
 *
 *  POST /api/generate
 *  Body: { prompt: string }
 *  Returns: { result: string }
 *
 *  Replace the mock logic below with your actual AI SDK call.
 *  Uncomment the OpenAI section when ready.
 * ──────────────────────────────────────────────────────────────
 */

// ─── Uncomment to use OpenAI ───
// import OpenAI from 'openai'
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A "prompt" string is required in the request body.' },
        { status: 400 }
      )
    }

    // ─── MOCK: Simulates a 2-second AI response ───
    const result = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `This is a mock AI response to: "${prompt.slice(0, 80)}..." — ` +
          `Replace this with a real OpenAI / Gemini / Anthropic call in production.`
        )
      }, 2000)
    })

    // ─── REAL OpenAI (uncomment when ready) ───
    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: [
    //     { role: 'system', content: 'You are a helpful assistant.' },
    //     { role: 'user', content: prompt },
    //   ],
    // })
    // const result = completion.choices[0].message.content

    return NextResponse.json({ result })
  } catch (error) {
    console.error('[/api/generate] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Check server logs.' },
      { status: 500 }
    )
  }
}
