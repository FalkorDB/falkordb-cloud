export default function Page() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="/sandbox">
            FalkorDB Cloud
          </a>
        </h1>
        <p className="mt-3 text-4xl">(Sandbox)</p>
      </main>
    </div>
  )
}

