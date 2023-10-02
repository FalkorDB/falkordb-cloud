import { NextResponse } from 'next/server';


export async function GET(request: Request) {


  // check if Authorization header is contains cron token
  let authorization = request.headers.get('Authorization');

  console.warn(authorization)
  console.warn(process.env.CRON_SECRET)


  if (!authorization || authorization !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  } 

  return NextResponse.json({ ok: true });

}