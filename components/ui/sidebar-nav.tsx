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
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react"

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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links =
    role === "admin"
      ? adminLinks
      : role === "employer"
        ? employerLinks
        : clientLinks;

  const roleLabel =
    role === "admin" ? "Admin" : role === "employer" ? "Employer" : "Client";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const SidebarContent = (isMobile?: boolean) => (
    <aside
      className={cn(
        "min-h-screen bg-card border-r flex flex-col relative transition-all duration-300 ease-in-out",
        isMobile ? "w-64" : collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Toggle Button — Desktop only */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-6 z-10 w-7 h-7 bg-neutral-200 border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      )}

      {/* Logo/Title */}
      <div
        className={cn(
          "border-b flex items-center transition-all duration-300",
          collapsed && !isMobile ? "p-4 justify-center" : "p-6 gap-3",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-xs font-bold">FA</span>
        </div>
          <div className={cn("overflow-hidden transition-all duration-300", collapsed && !isMobile ? "opacity-0" : "w-auto opacity-100")}>
            <h1 className="text-sm font-bold leading-tight whitespace-nowrap">
              Focus Australia
            </h1>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
      </div>

      {/* Navigation Links */}
      <nav
        className={cn(
          "flex-1 flex flex-col gap-1 transition-all duration-300",
          collapsed && !isMobile ? "p-2" : "p-4",
        )}
      >
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg text-sm transition-colors",
                collapsed && !isMobile
                  ? "p-2 justify-center"
                  : "gap-3 px-4 py-2",
                isActive
                  ? "bg-red-900 text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
              title={collapsed && !isMobile ? link.label : undefined}
            >
              {link.icon}
              <span
                className={cn(
                  "overflow-hidden transition-all duration-300 whitespace-nowrap", collapsed && !isMobile 
                  ? "w-0 opacity-0" 
                  : "w-auto opacity-100"
                )}
                >
                  {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout — hidden when collapsed */}
        <div 
          className={cn(
            "border-t overflow-hidden transition-all duration-300",
            collapsed && !isMobile ? "opacity-0 p-0" : "p-4 opacity-100"
          )}>
          <LogoutButton />
        </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-3 left-4 z-50 p-2 bg-card border rounded-lg shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={15} /> : <Menu size={15} />}
      </button>

      {/* {mobileOpen ? <div className="hidden"/> : <div className="md:hidden bg-black/10 fixed w-full p-7 backdrop-blur-xs"/>} */}

      {/* Mobile Overlay */}

      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-all duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "md:hidden fixed left-0 top-0 z-50 h-full transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {SidebarContent(true)}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">{SidebarContent(false)}</div>
    </>
  );
}
