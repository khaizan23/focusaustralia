"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutButton from "@/components/ui/logout-button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Briefcase,
  Upload,
  Users,
  Clock,
  Settings,
} from "lucide-react";

interface SidebarNavProps {
  role: "admin" | "client" | "employer"
}
interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const clientLinks: NavLink[] = [
  {href: "/client/dashboard",label: "Dashboard",icon: <LayoutDashboard size={16} />,},
  {href: "/client/background",label: "Background",icon: <Briefcase size={16} />,},
  { href: "/client/upload", label: "Upload Files", icon: <Upload size={16} /> },
];

const adminLinks: NavLink[] = [
  {href: "/admin/dashboard",label: "Dashboard",icon: <LayoutDashboard size={16} />},
  { href: "/admin/users", label: "Users", icon: <Users size={16} /> },
  {href: "/admin/pending-verifications",label: "Pending Verifications",icon: <Clock size={16} />,},
  { href: "/admin/settings", label: "Settings", icon: <Settings size={16} /> },
];

const employerLinks: NavLink[] = [
  {href: "/employer/dashboard",label: "Dashboard",icon: <LayoutDashboard size={16} />,},
  {href: "/employer/candidates",label: "Candidates",icon: <Users size={16} />,},
  {href: "/employer/settings",label: "Settings",icon: <Settings size={16} />,},
];

export default function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const links = 
    role === "admin" ? adminLinks :
    role === "employer" ? employerLinks : clientLinks

  return (
    <aside className="xs:w-10 md:w-64 min-h-screen bg-card border-r flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Focus Austasdralia</h1>
        <p className="text-sm text-muted-foreground capitalize">{role}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-colors flex gap-2 items-center",
              pathname === link.href
                ? "bg-red-900 text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t">
        <LogoutButton />
      </div>
    </aside>
  );
}