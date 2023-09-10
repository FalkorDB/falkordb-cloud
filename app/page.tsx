import { getServerSession } from "next-auth/next"
import type { NextRequest } from "next/server"
import SignInButtons from "@/app/components/SignInButtons"


export default function Page() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://www.falkordb.com">
            FalkorDB Cloud
          </a>
        </h1>
        <div>
          <SignInButtons/>
        </div>
      </main>
    </div>
  )
}

