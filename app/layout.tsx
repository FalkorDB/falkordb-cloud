import Navigation from "./components/navigation";
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from "./providers";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";

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
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics ga_id=
            {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}
