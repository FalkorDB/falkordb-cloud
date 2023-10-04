'use client';

import { signIn } from "next-auth/react"
import { Sandbox } from "@/app/api/db/sandbox";
import { useState, useEffect, use } from 'react'
import { Button } from "@/components/ui/button"
import Spinning from "../components/spinning";
import { useToast } from "@/components/ui/use-toast"
import { CypherInput } from "../components/cypherInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"


enum State {
  Loaded,
  InitialLoading,
  BuildingSandbox,
  DestroyingSandbox,
}

export default function Page() {
  const [retry_count, retry] = useState(0)
  const [sandbox, setSandbox] = useState<Sandbox | undefined>(undefined)
  const [loadingState, setLoading] = useState(State.InitialLoading)

  const { toast } = useToast()


  // fetch sandbox details if exists
  useEffect(() => {
    if (loadingState != State.InitialLoading
      && loadingState != State.BuildingSandbox) return

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

        // if sandbox is building, retry after 5 seconds
        if (sandbox?.status == "BUILDING") {
          setTimeout(() => {
            setLoading(State.BuildingSandbox)
            retry(retry_count + 1)
          }, 5000)
        } else {
          setLoading(State.Loaded)
        }
      })
  }, [loadingState, retry_count])

  // render loading state if needed
  switch (loadingState) {
    case State.InitialLoading:
      return <Spinning text="Loading Sandbox..." />
    case State.BuildingSandbox:
      return <Spinning text="Building the sandbox... (it might take a couple of minutes)" />
    case State.DestroyingSandbox:
      return <Spinning text="Destroying the sandbox..." />
  }

  // Create a sandbox on click
  function createSandbox(event: any) {
    event.currentTarget.disabled = true;
    fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      setLoading(State.BuildingSandbox)
    }).catch(() => {
      console.log("Failed to create sandbox")
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

  function copyToClipboard(event: any) {
    navigator.clipboard.writeText(event.target.innerText)
    toast({
      title: "Copied to clipboard",
      description: "The value has been copied to your clipboard.",
    })
  }

  async function sendQuery(query: string) {
    let result = await fetch(`/api/query?q=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (result.status<300) {
      let res = await result.json()
      return res.result  
    }
    toast({
      title: "Error",
      description: await result.text(),
    })
    return []
  }

  // render the sandbox details if exists
  if (sandbox) {
    let redisURL = `redis://${sandbox.password}@${sandbox.host}:${sandbox.port}`
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-4">
        <main className="flex flex-col flex-1 m-4">
          <div className="border-b-2 bg-white dark:bg-gray-800 shadow p-4 m-2">
            <Dialog>
              <DialogTrigger className="rounded-full bg-blue-600 p-2 text-slate-50">Delete Sandbox</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your sandbox
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <Button className="rounded-full bg-blue-600 p-4 text-slate-50" onClick={deleteSandbox}>Delete Sandbox</Button>
              </DialogContent>
            </Dialog>
            <div>Host: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{sandbox.host}</Button></div>
            <div>Port: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{sandbox.port}</Button></div>
            <div>Password: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{sandbox.password}</Button></div>
            <div>Redis URL: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{redisURL}</Button></div>
          </div>
          <CypherInput graphs={["falkordb", "graph2"]} onSubmit={sendQuery} />
        </main>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
          <Button className="rounded-full bg-blue-600 text-4xl p-8 text-slate-50" onClick={createSandbox}>Create Sandbox</Button>
        </main>
      </div>
    )
  }
}
