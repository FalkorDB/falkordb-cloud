"use client";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {

  return (
    <footer className="flex flex-row space-x-4 bg-[#E7E8EF] p-4 text-xs">
      <div className="flex flex-row basis-1/3 space-x-4">
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
        <Link className="underline" href="https://www.linkedin.com/company/falkordb">
          <div className="flex items-center space-x-2">
            <svg
              className=" h-6 w-6 text-muted-foreground"
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
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect height="12" width="4" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <span>Follow us on Linkedin</span>
          </div>
        </Link>
      </div >
      <div className="flex basis-1/3 justify-center">
        <p>© 2023 FalkorDB Inc. All rights reserved.</p>
      </div>
      <div className="basis-1/3">
      </div>
    </footer>
  )
}