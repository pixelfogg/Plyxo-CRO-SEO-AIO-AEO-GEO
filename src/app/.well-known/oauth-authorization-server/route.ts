import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Supabase URL not configured" }, { status: 500 });
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/.well-known/oauth-authorization-server/auth/v1`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from Supabase: ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error fetching OAuth configuration" }, 
      { status: 500 }
    );
  }
}
