import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Set today's date filter (00:00 IST)
    const now = new Date();
const localMidnight = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  0, 0, 0, 0
);
const utcTimestampSeconds = Math.floor(localMidnight.getTime() / 1000);

    let allIds: any[] = []
    let pageToken: string | null = null

    // ⭐ STEP 1: FETCH ALL EMAIL IDs WITH PAGINATION
    while (true) {
      const url = new URL(GMAIL_API)
      url.searchParams.set("q", `after:${utcTimestampSeconds} category:primary`);
      if (pageToken) url.searchParams.set("pageToken", pageToken)

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      })

      const data = await res.json()

      if (data.messages) {
        allIds = allIds.concat(data.messages)
      }

      if (!data.nextPageToken) break

      pageToken = data.nextPageToken
    }

    // No emails today
    if (allIds.length === 0) {
      return NextResponse.json({ messages: [] })
    }

    // ⭐ STEP 2: FETCH FULL METADATA FOR EACH EMAIL
    const messages = []

    for (const msg of allIds) {
      const msgRes = await fetch(`${GMAIL_API}/${msg.id}?format=metadata`, {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      })

      const messageData = await msgRes.json()
      const headers = messageData.payload.headers

      const subject =
        headers.find((h: any) => h.name === "Subject")?.value || "(No Subject)"
      const from =
        headers.find((h: any) => h.name === "From")?.value || "(Unknown Sender)"
      const date =
        headers.find((h: any) => h.name === "Date")?.value || "(Unknown Date)"

      messages.push({
        id: msg.id,
        subject,
        from,
        date,
        snippet: messageData.snippet || "",
      })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Gmail Fetch Error:", error)
    return NextResponse.json({ error: "Failed to fetch Gmail" })
  }
}
