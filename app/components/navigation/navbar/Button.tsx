'use client';

import { useSession, signIn, signOut } from "next-auth/react"

export default function Button() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    return (
      <button onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })} className="h-12 rounded-lg font-bold px-5">Sign in</button>
    );
  }
  return <button onClick={() => signOut({ callbackUrl: '/' })} className="h-12 rounded-lg font-bold px-5">Log Out</button>
}

