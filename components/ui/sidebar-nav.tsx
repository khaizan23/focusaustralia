"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutButton from "@/components/ui/logout-button"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  role: "admin" | "client"
}

const clientLinks = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/upload", label: "Upload Video" },
  { href: "/client/my-videos", label: "My Videos" },
]

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/allvideos", label: "All Videos" },
  { href: "/admin/users", label: "Users" },
]

export default function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const links = role === "admin" ? adminLinks : clientLinks

  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col">
      
      {/* Logo/Title */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Focus Australia</h1>
        <p className="text-sm text-muted-foreground capitalize">{role}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-colors",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <LogoutButton />
      </div>

    </aside>
  )
}