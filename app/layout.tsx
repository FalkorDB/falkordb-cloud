import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from "@/app/providers";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import { Toaster } from "@/components/ui/toaster"
import Footer from '@/app/components/footer';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FalkorDB Cloud',
  description: 'FalkorDB Cloud is an hosted cloud service for FalkorDB.',
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
        <Toaster />
        <Footer />
        <script type="text/javascript" id="hs-script-loader" async defer src="//js-eu1.hs-scripts.com/144055056.js"></script>
      </body>
    </html>
  )
}
