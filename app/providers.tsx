"use client";

import { SessionProvider } from "next-auth/react";
import Navigation from "./components/navigation";

type Props = {
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
  return (
    <SessionProvider>
      <Navigation />
      {children}
    </SessionProvider>
  )
};