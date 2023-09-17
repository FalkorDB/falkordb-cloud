'use client';

import { data } from "autoprefixer";
import { useSession, getSession, signIn } from "next-auth/react"
import { redirect } from 'next/navigation';
import { useState } from "react";
import { UserEntity } from "../api/models/entities";

export default function Page() {
  const [disabled, setDisabled] = useState(false);

  const { data: session, status } = useSession()

  if (status === "loading") {
    return <p className="text-blue-600 text-3xl">Loading...</p>
  }

  if (status === "unauthenticated") {
    signIn(undefined, { callbackUrl: '/sandbox' })
  }
  
  function deleteSandbox(){
    setDisabled(true);

    fetch('/api/db', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({session: session})
    })
    .then(response => {
      console.log(response.json())
      redirect('/dashboard')
    })
  }
  let host = "asfdsa.com"
  let port = "1234"
  let password = "Asasdsad"
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 space-y-4">
        <div className="text-4xl font-bold">
          <div>Host: <span className="text-blue-600">{host}</span></div> 
          <div>Port: <span className="text-blue-600">{port}</span></div>
          <div>Password: <span className="text-blue-600">{password}</span></div>  
          <div>Redis URL: <span className="text-blue-600">redis://{password}@{host}:{port}</span></div>  
        </div>
        <button className="rounded-full bg-blue-600 text-2xl p-3" disabled={disabled} onClick={deleteSandbox}>Delete Sandbox</button>
      </main>
    </div>
  )
}
