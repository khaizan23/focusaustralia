import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get("sb-access-token")?.value

  // Kung hindi naka-login
  if (!token && path !== "/login" && path !== "/register") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Kung naka-login na pero pumunta sa login/register
  if (token && (path === "/login" || path === "/register")) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser(token)

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/client/dashboard", request.url))
      }
    }
  }

  // Kung naka-login at nag-access ng /admin/*
  if (token && path.startsWith("/admin")) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Kung hindi admin — i-redirect sa client dashboard
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/client/dashboard", request.url))
    }
  }

  // Kung naka-login at nag-access ng /client/*
  if (token && path.startsWith("/client")) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Kung admin nag-access ng client pages — i-redirect sa admin dashboard
    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/login",
    "/register"
  ]
}