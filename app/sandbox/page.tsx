'use client';

import { signIn } from "next-auth/react"
import { Sandbox } from "@/app/api/db/sandbox";
import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { CypherInput } from "./CypherInput";
import { DatabaseDetails } from "./DatabaseDetails";
import { LoadingState, State } from "./LoadingState";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react"
import { Create } from "./Create";
import { Monitor } from "./Monitor";

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
  if (loadingState != State.Loaded) {
    return <LoadingState state={loadingState} />
  }

  // Create a sandbox on click
  function createSandbox(region: string, tls: boolean) {
    fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ region, tls })
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

  async function sendQuery(graph: string, query: string) {
    let result = await fetch(`/api/graph/${graph}?q=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (result.status < 300) {
      let res = await result.json()
      return res.result
    }
    toast({
      title: "Error",
      description: await result.text(),
    })
    return []
  }

  async function getNode(graph: string, id: number) {
    let result = await fetch(`/api/graph/${graph}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (result.status < 300) {
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
      <main className="flex flex-col min-h-screen">
        <Collapsible className="p-2 bg-gray-200 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300 m-1">
          <CollapsibleTrigger className="flex flex-row p-1 space-x-2">
            <ChevronsUpDown /> Connection Details
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2 bg-white rounded-lg">
            <DatabaseDetails sandbox={sandbox} onDelete={deleteSandbox} />
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="p-2 bg-gray-200 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300 m-1">
          <CollapsibleTrigger className="flex flex-row p-1 space-x-2">
            <ChevronsUpDown /> Monitor
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2 bg-white rounded-lg">
            <Monitor/>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible defaultOpen={true} className="p-2 bg-gray-200 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300 m-1">
          <CollapsibleTrigger className="flex flex-row p-1 space-x-2">
            <ChevronsUpDown /> Query Pane
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2 bg-white rounded-lg">
            <CypherInput onSubmit={sendQuery} onGraphClick={getNode} />
          </CollapsibleContent>
        </Collapsible>
      </main>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-row space-x-2 items-center justify-center flex-1 px-20 text-center">
          <Create onCreate={createSandbox} />
        </main>
      </div>
    )
  }
}
