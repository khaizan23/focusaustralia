"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutButton from "@/components/ui/logout-button"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  role: "admin" | "client" | "employer"
}

const clientLinks = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/background", label: "Background" },
  { href: "/client/upload", label: "Upload Files" },
  { href: "/client/my-videos", label: "My Videos" },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/pending-verifications", label: "Pending Verifications" },
  { href: "/admin/allvideos", label: "All Videos" },
  { href: "/admin/settings", label: "Settings" },
];

const employerLinks = [
  { href: "/employer/dashboard", label: "Dashboard" },
  { href: "/employer/candidates", label: "Candidates" },
  { href: "/employer/settings", label: "Settings" },
];

export default function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const links = 
    role === "admin" ? adminLinks :
    role === "employer" ? employerLinks: clientLinks

  return (
    <aside className="xs:w-10 md:w-64 min-h-screen bg-card border-r flex flex-col">
      
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
                ? "bg-red-900 text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t">
        <LogoutButton />
      </div>

    </aside>
  )
}