'use client';

import { signIn, useSession } from "next-auth/react"
import { Sandbox } from "@/app/api/db/sandbox";
import { useState, useEffect, use } from 'react'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton";
import Spinning from "../components/spinning";

enum State {
  Loaded,
  InitialLoading,
  BuildingSandbox,
  DestroyingSandbox,
}

export default function Page() {

  const [sandbox, setSandbox] = useState<Sandbox | undefined>(undefined)
  const [loadingState, setLoading] = useState(State.InitialLoading)

  // fetch sandbox details if exists
  useEffect(() => {
    if (loadingState != 1) return

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
        setSandbox(sandbox)
        setLoading(State.Loaded)
      })
  }, [loadingState])

  // render loading state if needed
  switch (loadingState){
    case State.InitialLoading:
      return <Spinning text="Loading Sandbox..." />
    case State.BuildingSandbox:
      return <Spinning text="Building the sandbox... (it might take a couple of minutes)" />
    case State.DestroyingSandbox:
      return <Spinning text="Destroying the sandbox..." />
  }

  // Create a sandbox on click
  function createSandbox(event: any) {
    setLoading(State.BuildingSandbox)
    fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      setLoading(State.InitialLoading)
    })
  }

  // Delete a sandbox on click
  function deleteSandbox() {
    setLoading(State.DestroyingSandbox)
    fetch('/api/db', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      setLoading(State.InitialLoading)
    })
  }

  // render the sandbox details if exists
  if (sandbox) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-20 space-y-4">
          <div className="text-4xl">
            <div>Host: <span className="text-blue-600">{sandbox.host}</span></div>
            <div>Port: <span className="text-blue-600">{sandbox.port}</span></div>
            <div>Password: <span className="text-blue-600">{sandbox.password}</span></div>
            <div>Created: <span className="text-blue-600">{sandbox.create_time}</span></div>
            <div>Redis URL: <span className="text-blue-600">redis://{sandbox.password}@{sandbox.host}:{sandbox.port}</span></div>
          </div>
          <Button className="rounded-full bg-blue-600 text-4xl p-8 text-black" onClick={deleteSandbox}>Delete Sandbox</Button>
        </main>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
          <Button className="rounded-full bg-blue-600 text-5xl font-bold p-20 text-black" onClick={createSandbox}>Create Sandbox</Button>
        </main>
      </div>
    )
  }
}

