import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { fullName, email, password } = await request.json()

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    )
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  )

  // Gumawa ng bagong user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "admin",
    }
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // I-update ang profile role sa admin
  await supabaseAdmin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", data.user.id)

  return NextResponse.json({
    success: true,
    userId: data.user.id
  })
}