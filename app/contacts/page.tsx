import React from "react";

const Contacts = () => {
  return (
  <div className="flex flex-col items-center justify-center min-h-screen py-2">
    <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
      <h1 className="text-6xl font-bold">Contacts</h1>
      <div className="flex flex-col text-5xl text-blue-600">
        <a href="https://discord.gg/FSVxem3A">Discord</a>
        <a href="mailto:info@falkordb.com">info@falkordb.com</a>
        <a href="https://github.com/orgs/FalkorDB/discussions">Discussions</a>
      </div>
    </main>
  </div>
  )
};

export default Contacts;