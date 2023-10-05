import React from "react";

import Link from "next/link"

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Contact Us</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Connect with us on your preferred platform</p>
          </div>
          <div className="flex flex-col items-start space-y-4">
            <Link className="underline" href="https://discord.gg/99y2Ubh6tg">
              <div className="flex items-center space-x-2">
                <svg
                  className=" w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                <span>Join us on Discord</span>
              </div>
            </Link>
            <Link className="underline" href="mailto:info@falkordb.com">
              <div className="flex items-center space-x-2">
                <svg
                  className=" w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="16" rx="2" width="20" x="2" y="4" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>Email us at info@falkordb.com</span>
              </div>
            </Link>
            <Link className="underline" href="https://twitter.com/falkordb">
              <div className="flex items-center space-x-2">
                <svg
                  className=" w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span>Follow us on Twitter</span>
              </div>
            </Link>
            <Link className="underline" href="https://github.com/orgs/FalkorDB/discussions">
              <div className="flex items-center space-x-2">
                <svg
                  className=" w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span>Discuss with us on Github</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div >
  )
}
