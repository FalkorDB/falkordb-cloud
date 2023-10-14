import { NextResponse } from 'next/server';

// Heartbeat URL
const url = "https://ping.checklyhq.com/b8f8de24-3fde-438a-9f7c-b5b4f42fe459"

export async function GET(request: Request) {

  // check if Authorization header is contains cron token
  let authorization = request.headers.get('Authorization');
  if (!authorization || authorization !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  } 


  // TODO add clean inactive sandboxes for more than 24h

  // A GET request to the Heartbeat
  fetch(url).then(response => console.log(response)) 

  return NextResponse.json({ ok: true });
}