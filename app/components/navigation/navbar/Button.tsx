'use client';

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from "next/link";

export default function Button() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    return (
      <Link href="/api/auth/signin" className="h-12 rounded-lg font-bold px-5">Sign In</Link>
    );
  }
  return <button onClick={() => signOut()} className="h-12 rounded-lg font-bold px-5">Log Out</button>
}

