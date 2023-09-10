'use client'

import { signIn } from "next-auth/react"
import { getProviders } from "next-auth/react";

export default async function SignInButtons() : Promise<any> {

  const providers = await getProviders();

  return (
    <div>
      {Object.values(providers).map((provider) => {
        return (
          <div key={provider.name}>
            <button onClick={() => signIn(provider.id)}>
              Sign in with {provider.name}
            </button>
          </div>
        );
      })}
    </div>
  );
}