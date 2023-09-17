'use client';

import { signIn } from "next-auth/react"
import { Sandbox } from "@/app/api/db/sandbox";
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function Page() {
  
  const [sandbox, setData] = useState<Sandbox|undefined>(undefined)
  const [isLoading, setLoading] = useState(true)

  // if (status === "loading") {
  //   return <p className="text-blue-600 text-3xl">Loading...</p>
  // }

  // if (status === "unauthenticated") {
  //   signIn(undefined, { callbackUrl: '/sandbox' })
  // }

  useEffect(() => {
    if(!isLoading) return

    fetch('/api/db')
      .then((res) => {
        switch (res.status) {
          case 200:
            return res.json()
          case 401:
            signIn(undefined, { callbackUrl: '/sandbox' })
          default:
            return undefined
        }
      })
      .then((sandbox) => {
        setData(sandbox)
        setLoading(false)
      })
  }, [isLoading])

  if (isLoading) {
    return <p className="text-blue-600 text-3xl">Loading sandbox...</p>
  }

  async function createSandbox() {
    fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    setLoading(true)
  }

  function deleteSandbox() {
    fetch('/api/db', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    setLoading(true)
  }

  if (sandbox) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-20 space-y-4">
          <div className="text-4xl font-bold">
            <div>Host: <span className="text-blue-600">{sandbox.host}</span></div>
            <div>Port: <span className="text-blue-600">{sandbox.port}</span></div>
            <div>Password: <span className="text-blue-600">{sandbox.password}</span></div>
            <div>Created: <span className="text-blue-600">{sandbox.create_time}</span></div>
            <div>Redis URL: <span className="text-blue-600">redis://{sandbox.password}@{sandbox.host}:{sandbox.port}</span></div>
          </div>
          <Button className="rounded-full bg-blue-600 text-2xl p-3 text-black" onClick={deleteSandbox}>Delete Sandbox</Button>
        </main>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
          <Button className="rounded-full bg-blue-600 text-6xl font-bold p-20 text-black" onClick={createSandbox}>Create Sandbox</Button>
        </main>
      </div>
    )
  }
}

