
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Page() {
    return (
        <section className="w-full h-screen py-12 md:py-24 lg:py-32 xl:py-48 bg-black" >
            <div className="container px-4 md:px-6" >
                <div className="grid gap-6 items-center" >
                    <div className="flex flex-col justify-center space-y-4 text-center" >
                        <div className="space-y-2" >
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                                Sign up for our newsletter
                            </h1>
                            <p className="max-w-[600px] text-zinc-200 md:text-xl dark:text-zinc-100 mx-auto" >
                                Join our newsletter and get the latest news and articles sent straight to your inbox.
                            </p>
                        </div>
                        <div className="w-full max-w-sm space-y-2 mx-auto" >
                            <form className="flex space-x-2" >
                                <Input
                                    className="max-w-lg flex-1 bg-gray-800 text-white border-gray-900"
                                    placeholder="Enter your email"
                                    type="email"
                                />
                                <Button className="bg-white text-black" type="submit">
                                    Join Now
                                </Button>
                            </form>
                            <p className="text-xs text-zinc-200 dark:text-zinc-100" >
                                By signing up, you agree to our{" "}
                                <Link className="underline underline-offset-2 text-white" href="/terms">
                                    Terms & Conditions
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}