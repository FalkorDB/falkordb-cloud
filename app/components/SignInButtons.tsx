'use client'

import { signIn } from "next-auth/react"
import { getProviders } from "next-auth/react";

export default async function SignInButtons(): Promise<any> {

    const providers = await getProviders();

    // Check if providers is null
    if (!providers) {
        // Display an error message or a loading indicator
        return <div>Unable to load providers</div>;
    }

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