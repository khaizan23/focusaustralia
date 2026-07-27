import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1 — About */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground text-xs font-bold">
                  FA
                </span>
              </div>
              <span className="font-bold text-sm">Focus Australia</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Helping skilled workers find opportunities in Australia. Your
              trusted migration consultancy partner.
            </p>
            {/* Social Media */}
            <div className="flex gap-3 mt-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail size={18} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail size={18} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Section 2 — Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Home", href: "#" },
                { label: "About Us", href: "#" },
                { label: "Contact Us", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Section 3 — For Users */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">For Users</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Register as Client", href: "/register/client" },
                { label: "Register as Employer", href: "/register/employer" },
                { label: "Login", href: "/login" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Section 4 — Contact Info */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Contact Us</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Mail size={14} className="shrink-0 mt-0.5" />
                <span>info@focusaustralia.com.au</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Phone size={14} className="shrink-0 mt-0.5" />
                <span>+61 X XXXX XXXX</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>Perth, Western Australia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Focus Australia. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}