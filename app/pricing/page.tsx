/**
 * v0 by Vercel.
 * @see https://v0.dev/t/rRBlufM
 */
import { Button } from "@/components/ui/button"
import FeatureItem from "./FeatureItem"
import Link from "next/link"

export default function Page() {
  return (
    <div className="min-h-screen w-full py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
      <main className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3 md:gap-8">
          <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
            <div>
              <h3 className="text-2xl font-bold text-center">Free</h3>
              <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
                <span className="text-4xl font-bold">$0</span>/ month
              </div>
              <ul className="mt-4 space-y-2">
                <FeatureItem text="Single Shard" />
                <FeatureItem text="Online Support" />
              </ul>
            </div>
            <Link className="mt-6" href="/sandbox">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
          <div className="relative flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-purple-500">
            <div className="px-3 py-1 text-sm text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              Coming Soon
            </div>
            <div>
              <h3 className="text-2xl font-bold text-center">Standard</h3>
              <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
                <span className="text-4xl font-bold">$X</span>/ month
              </div>
              <ul className="mt-4 space-y-2">
                {/* <FeatureItem text="Single Shard" />
                <FeatureItem text="720p Video Rendering" /> */}
              </ul>
            </div>
            <Link className="mt-6" href="/sandbox">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500">Get Started</Button>
            </Link>
          </div>
          <div className="relative flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
            <div className="px-3 py-1 text-sm text-white bg-gradient-to-r from-slate-900 to-slate-600 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              Coming Soon
            </div>
            <div>
              <h3 className="text-2xl font-bold text-center">Enterprise</h3>
              <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
                <span className="text-4xl font-bold">$Y</span>/ month
              </div>
              <ul className="mt-4 space-y-2">
                {/* <FeatureItem text="Single Shard" />
                <FeatureItem text="720p Video Rendering" /> */}
              </ul>
            </div>
            <Link className="mt-6" href="/sandbox">
                <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
