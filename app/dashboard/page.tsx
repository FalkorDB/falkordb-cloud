'use client';

import { useSession, getSession, signIn } from "next-auth/react"

export default function Page() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (status === "unauthenticated") {
    signIn(undefined, { callbackUrl: '/dashboard' })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <button className="text-6xl font-bold">Create Sandbox</button>
      </main>
    </div>
  )
}
