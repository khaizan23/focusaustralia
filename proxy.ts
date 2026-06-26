import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const rawToken = request.cookies.get("sb-access-token")?.value
  const token = rawToken ? decodeURIComponent(rawToken) : undefined

  // Kung hindi naka-login
  if (!token && 
    path !== "/login" && 
    path !== "/register" && 
    path !== "/register/client" && 
    path !== "/register/employer"
  ) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Kung naka-login na pero pumunta sa login/register
    if (token && (
      path === "/login" || 
      path === "/register" ||
      path === "/register/client" ||
      path === "/register/employer"
    )) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
      )

      const { data: { user } } = await supabase.auth.getUser(token)

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, verification_status")
          .eq("id", user.id)
          .single()

        if (profile?.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url))
        } else if (profile?.role === "employer") {
          if (profile?.verification_status === "verified") {
            return NextResponse.redirect(new URL("/employer/dashboard", request.url))
          } else if (profile?.verification_status === "rejected") {
            return NextResponse.next()
          } else {
            return NextResponse.redirect(new URL("/employer/pending", request.url))
          }
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

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url))
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

      if (profile?.role !== "client") {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    // Kung naka-login at nag-access ng /employer/*
    if (token && path.startsWith("/employer")) {
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
        .select("role, verification_status")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "employer") {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Kung employer pero hindi pa verified
      if (profile?.verification_status === "pending" && path !== "/employer/pending") {
        return NextResponse.redirect(new URL("/employer/pending", request.url))
      }

      if (profile?.verification_status === "verified" && path === "/employer/pending") {
        return NextResponse.redirect(new URL("/employer/dashboard", request.url))
      }

      // Kung employer pero rejected
      if (profile?.verification_status === "rejected") {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/employer/:path*",
    "/login",
    "/register",
    "/register/client",
    "/register/employer",
  ]
}