import Navigation from "./components/navigation";
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from "./providers";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FalkorDB Cloud',
  description: 'FalkorDB Cloud is a cloud service for FalkorDB.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}
