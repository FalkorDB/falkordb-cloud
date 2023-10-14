import React from "react";

import Link from "next/link"
import { Github, Mail, MessageSquare } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <div className="space-y-8 p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Contact Us</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Connect with us on your preferred platform</p>
          </div>
          <div className="flex flex-col items-start space-y-4">
            <Link className="underline" href="https://discord.gg/99y2Ubh6tg">
              <div className="flex items-center space-x-2">
                <MessageSquare />
                <span>Join us on Discord</span>
              </div>
            </Link>
            <Link className="underline" href="mailto:support@falkordb.com">
              <div className="flex items-center space-x-2">
                <Mail />
                <span>Email us at support@falkordb.com</span>
              </div>
            </Link>
            <Link className="underline" href="https://github.com/orgs/FalkorDB/discussions">
              <div className="flex items-center space-x-2">
                <Github />
                <span>Discuss with us on Github</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div >
  )
}
