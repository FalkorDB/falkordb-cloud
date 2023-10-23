"use client"

import { toast } from "@/components/ui/use-toast";
import { DataTable } from "../components/table/DataTable";
import useSWR from 'swr'
import { useState } from "react";
import Spinning from "../components/spinning";
import { Row } from "@tanstack/react-table";


interface User {
  id: string,
  name: string
  email: string
  db_host: string,
  db_port: number,
  db_create_time: string,
  tls: string,
  task_arn: string,     
}

function getUsers(props: {pageIndex:number}): Promise<User[]> {
  return fetch('/api/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((result) => {
      if (result.status < 300) {
        return result.json()
      }
      toast({
        title: "Error",
        description: result.text(),
      })
      return { result: [] }
    })
}

function deleteSandbox(row: Row<any>) {
  let user:User = row.original

  if (!user.task_arn){
    toast({
      title: "Error",
      description: "No sandbox found",
    })
    return
  }

  fetch(`/api/db/${encodeURIComponent(user.task_arn)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((result) => {
      if (result.status < 300) {
        return result.json()
      }
      toast({
        title: "Error",
        description: result.text(),
      })
      return { result: [] }
    })
}


export default function Page() {

  const [pageIndex, setPageIndex] = useState(0);

  // Fetch data from server on users
  const { data, error, isLoading } = useSWR({pageIndex}, getUsers)

  if (isLoading) return <Spinning text="Loading users..." />

  // returns a table of all the users in the database
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <div className="space-y-8 p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
          {
            (error || !data) ? 
            <div>failed to load</div> :
            <DataTable rows={data} 
            columnNames={["email", "id", "name", "db_host", "db_port", "db_create_time", "tls", "task_arn"]}
            actions={[
              { name: "Delete Sandbox", onAction:deleteSandbox, warning:"This action cannot be undone. This will permanently delete your sandbox and remove the data from our servers." },
            ]}
             />
          }
        </div>
      </main>
    </div >
  )
}
