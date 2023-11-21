"use client"

import { Button } from '@/components/ui/button';
import { useSession, signIn, signOut } from 'next-auth/react';
import Spinning from '../components/spinning';
import { Google } from '../components/icons/google';
import { Github } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from 'react';

export default function Page() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/'

    // If the user is redirected to this page because of a sign-in error,
    // the error query parameter will be set
    const error = searchParams.get('error')

    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect to home page if already signed in
    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/sandbox');
        }
    }, [status, router]);

    // Render a loading message while checking the session
    if (status === 'loading') {
        return <Spinning text="Loading..." />
    }

    // Render the sign-in page
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
                <div className="flex flex-col space-y-6 p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
                    <h1 className="text-3xl font-bold">Sign in to your account</h1>
                    <Button className='flex flex-row text-xl p-6 space-x-2' onClick={() => signIn('github', { callbackUrl })}>
                        <Github />
                        <p>Sign in with GitHub</p>
                    </Button>
                    <Button className='flex flex-row text-xl p-6 space-x-2' onClick={() => signIn('google', { callbackUrl })}>
                        <Google />
                        <p>Sign in with Google</p>
                    </Button>
                    {error &&
                        <div className="bg-red-600 text-white py-2 px-4 text-left rounded-lg text-base">
                            <p>To confirm your identity, sign in with</p>
                            <p>the same account you used originally.</p>
                        </div>
                    }
                </div>
            </main>
        </div>
    );
}

