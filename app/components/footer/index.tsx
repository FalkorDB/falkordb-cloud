"use client";
import { Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {

  return (
    <footer className="flex flex-row space-x-4 bg-[#E7E8EF] p-4 text-xs">
      <div className="flex flex-row basis-1/3 space-x-4">
        <Link className="underline" href="https://twitter.com/falkordb">
          <div className="flex items-center space-x-2">
            <Twitter />
            <span>Follow us on Twitter</span>
          </div>
        </Link>
        <Link className="underline" href="https://www.linkedin.com/company/falkordb">
          <div className="flex items-center space-x-2">
            <Linkedin />
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