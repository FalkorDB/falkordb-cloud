'use client';

import { signIn } from "next-auth/react"
import { Sandbox } from "@/app/api/db/sandbox";
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CypherInput } from "./CypherInput";
import { DatabaseDetails } from "./DatabaseDetails";
import { LoadingState, State } from "./LoadingState";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react"
import { Combobox } from "../components/combobox";
import { AWS } from "../components/icons/aws";

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

  const zones = ["eu-north-1"]
  const selectedZone = zones[0]

  // render the sandbox details if exists
  if (sandbox) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen py-4">
        <main className="flex flex-col flex-1 m-4 w-screen">
          <Collapsible className="p-2 bg-gray-200 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300 mx-4 my-2">
            <CollapsibleTrigger className="flex flex-row m-2 space-x-2">
              <ChevronsUpDown /> Connection Details
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 bg-white rounded-lg">
              <DatabaseDetails sandbox={sandbox} onDelete={deleteSandbox} />
            </CollapsibleContent>
          </Collapsible>
          <Collapsible className="p-2 bg-gray-200 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300 mx-4 my-2">
            <CollapsibleTrigger className="flex flex-row m-2 space-x-2">
              <ChevronsUpDown /> Query Pane
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 bg-white rounded-lg">
              <CypherInput onSubmit={sendQuery} onGraphClick={getNode} />
            </CollapsibleContent>
          </Collapsible>
        </main>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-row space-x-2 items-center justify-center flex-1 px-20 text-center">
          <Combobox className="text-1xl p-8 shadow-lg rounded-lg  border border-gray-300"
            type={"Zones"}
            options={zones} 
            selectedValue={selectedZone} setSelectedValue={() => { }} />
          <Button className="bg-blue-600 text-4xl p-8 text-slate-50" onClick={createSandbox}>Create Sandbox</Button>
        </main>
      </div>
    )
  }
}
