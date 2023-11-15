"use client"

import { useSearchParams } from 'next/navigation'


import { Monitor } from "@/app/sandbox/Monitor"

export default function Page() {

  const searchParams = useSearchParams()
  const task_arn = searchParams.get('task_arn')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        {task_arn && <Monitor task_arn={task_arn} />}
      </main>
    </div>
  )
}
