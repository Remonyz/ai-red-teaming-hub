import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Berkeley Risk & Security Lab',
  description: 'Comprehensive knowledge hub by Berkeley Risk & Security Lab',
  generator: 'Berkeley Risk & Security Lab',
  icons: {
    icon: '/brsl-logo.png',
    shortcut: '/brsl-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
