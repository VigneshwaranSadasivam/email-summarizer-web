import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: NextRequest) {
  try {
    const { subject, from, snippet } = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
    })

    const prompt = `
Summarize this email in 1–2 sentences.
Focus ONLY on important actionable items.

Subject: ${subject}
From: ${from}
Snippet: ${snippet}
`

    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Gemini Error:", error)
    return NextResponse.json(
      { error: "Gemini summarization failed" },
      { status: 500 }
    )
  }
}
