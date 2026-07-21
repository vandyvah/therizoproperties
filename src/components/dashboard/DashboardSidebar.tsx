import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Calendar,
  HandshakeIcon,
  Calculator,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Mail,
  ShieldCheck,
  FileText,
  Package,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/leads", label: "Leads", icon: UserCheck },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/viewings", label: "Viewings", icon: Calendar },
  { href: "/dashboard/deals", label: "Deals", icon: HandshakeIcon },
  { href: "/dashboard/roi", label: "ROI Calculator", icon: Calculator },
];

const adminNavItems = [
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/blog", label: "Blog", icon: FileText },
  { href: "/dashboard/material-requests", label: "Materials Supply", icon: Package },
];
const superAdminNavItems = [
  { href: "/dashboard/users", label: "User Management", icon: ShieldCheck },
];

const settingsNavItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { profile, role, isAdmin, isSuperAdmin, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Build nav items based on role
  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? adminNavItems : []),
    ...(isSuperAdmin ? superAdminNavItems : []),
    ...settingsNavItems,
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-primary text-primary-foreground flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-gold" />
            <span className="font-display text-xl font-semibold">Therizo</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                    isActive
                      ? "bg-gold text-foreground"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  <item.icon size={20} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-primary-foreground/10">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-primary-foreground/50 capitalize">{role || "No role"}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={signOut}
          className="w-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <LogOut size={18} />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
