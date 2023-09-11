'use client';

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link";

export default function Button() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    return (
      <button onClick={() => signIn()} className="h-12 rounded-lg font-bold px-5">Sign in</button>
    );
  }
  return <button onClick={() => signOut()} className="h-12 rounded-lg font-bold px-5">Log Out</button>
}

