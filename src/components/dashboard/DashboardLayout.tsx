import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { AdminNotifications } from "./AdminNotifications";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/dashboard/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar />
      
      {/* Top Header Bar for Notifications */}
      {(isAdmin || isSuperAdmin) && (
        <div className="fixed top-0 right-0 left-64 h-14 bg-navy border-b border-navy/50 flex items-center justify-end px-6 z-40">
          <AdminNotifications />
        </div>
      )}
      
      <main className={`ml-64 p-6 ${isAdmin || isSuperAdmin ? 'pt-20' : ''}`}>
        {children}
      </main>
    </div>
  );
}
