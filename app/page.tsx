"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Home() {
  const { data: session } = useSession()
  const [emails, setEmails] = useState<any[]>([])
  const [summaries, setSummaries] = useState<any>({})

  useEffect(() => {
    if (session) {
      fetch("/api/gmail")
        .then((res) => res.json())
        .then((data) => {
          setEmails(data.messages || [])
        })
    }
  }, [session])

  const summarizeEmail = async (email: any) => {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email),
    })

    const data = await res.json()

    setSummaries((prev: any) => ({
      ...prev,
      [email.id]: data.summary,
    }))
  }

  if (!session) {
    return (
      <div>
        <h1>Email Summarizer</h1>
        <button onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Welcome {session.user?.name}</h1>
      <button onClick={() => signOut()}>Sign out</button>

      <h2>Your Recent Emails</h2>

      <div>
        {emails.map((email) => (
          <div
            key={email.id}
            style={{
              padding: "10px",
              margin: "10px 0",
              border: "1px solid #ccc",
            }}
          >
            <p><b>Subject:</b> {email.subject}</p>
            <p><b>From:</b> {email.from}</p>
            <p><b>Date:</b> {email.date}</p>
            <p><b>Snippet:</b> {email.snippet}</p>

            <button onClick={() => summarizeEmail(email)}>
              Summarize
            </button>

            {summaries[email.id] && (
              <p
                style={{
                  marginTop: "10px",
                  background: "#f3f3f3",
                  padding: "8px",
                }}
              >
                <b>Summary:</b> {summaries[email.id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
