'use client';

import { signIn } from "next-auth/react"
import { Sandbox } from "@/app/api/db/sandbox";
import { useState, useEffect, use } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CypherInput } from "./CypherInput";
import { DatabaseDetails } from "./DatabaseDetails";
import { LoadingState, State } from "./LoadingState";

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
  if (loadingState != State.Loaded){
    return <LoadingState state={loadingState}/>
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-4">
        <main className="flex flex-col flex-1 m-4">
          <div className="bg-white dark:bg-gray-800 shadow p-4 m-2">
            <DatabaseDetails sandbox={sandbox} onDelete={deleteSandbox} />
          </div>
          <div className="bg-white dark:bg-gray-800 shadow p-4 m-2">
            <CypherInput graphs={["falkordb", "graph2"]} onSubmit={sendQuery} />
          </div>
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
