import "./globals.css"
import SessionProviderWrapper from "./SessionProviderWrapper"

export const metadata = {
  title: "Email Summarizer",
  description: "App for Gmail Summaries",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  )
}
