"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Monitor } from "@/app/sandbox/Monitor"


/**
 * Wrapper for the Monitor component that gets the task_arn from the URL
 * Only needed so it can be wrapped with Suspense
 * @returns Monitor component if task_arn is present in the URL
 */
function ShowMonitor() {
  const searchParams = useSearchParams()
  const task_arn = searchParams.get('task_arn')

  return task_arn && <Monitor task_arn={task_arn} />
}

export default function Page() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <Suspense>
          <ShowMonitor />
        </Suspense>
      </main>
    </div>
  )
}
