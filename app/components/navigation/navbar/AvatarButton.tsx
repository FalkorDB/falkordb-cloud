'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signIn, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// A function that takes a full name as a string and returns its initials as a string
function getInitials(fullName: string): string {
  // Split the full name by spaces and store the parts in an array
  let nameParts = fullName.split(" ");
  // Initialize an empty string to store the initials
  let initials = "";
  // Loop through the name parts array
  for (let part of nameParts) {
    // If the part is not empty, append its first character (uppercased) to the initials string
    if (part) {
      initials += part[0].toUpperCase();
    }
  }
  // Return the initials string
  return initials;
}


export default function AvatarButton() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    return (
      <button onClick={() => signIn(undefined, { callbackUrl: '/sandbox' })}
        className="h-12 rounded-lg font-bold px-5 text-slate-50">
        Sign in
      </button>
    )
  }

  const name = session?.user?.name;
  const image = session?.user?.image ?? ""
  const initials = name ? getInitials(name) : ""
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="h-12 rounded-lg font-bold px-5 text-slate-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage alt="@shadcn" src={image} />
              <AvatarFallback className="text-blue-600">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5 text-xs">
              <div className="text-slate-50">{name}</div>
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem> */}
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

