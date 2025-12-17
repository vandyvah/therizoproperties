import { useState, useEffect } from "react";
import { Bell, UserPlus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: {
    user_id?: string;
    profile_id?: string;
    email?: string;
    full_name?: string;
  };
  read: boolean;
  created_at: string;
}

export function AdminNotifications() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) return;

    fetchNotifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, isSuperAdmin]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data as Notification[]);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("admin_notifications")
      .update({ read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("admin_notifications")
      .update({ read: true })
      .in("id", unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!isAdmin && !isSuperAdmin) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-ivory/70 hover:text-ivory hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-navy text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 bg-navy border-navy/50"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="font-semibold text-ivory">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-gold hover:text-gold/80 hover:bg-white/5 h-7"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-ivory/50 text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  !notification.read ? "bg-gold/10" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      notification.type === "new_user"
                        ? "bg-gold/20 text-gold"
                        : "bg-white/10 text-ivory/50"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ivory truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-ivory/60 mt-0.5 truncate">
                      {notification.metadata?.email || notification.metadata?.full_name}
                    </p>
                    <p className="text-xs text-ivory/40 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 text-ivory/40 hover:text-ivory hover:bg-white/10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {isSuperAdmin && unreadCount > 0 && (
          <div className="p-3 border-t border-white/10">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full text-gold hover:text-gold/80 hover:bg-white/5"
            >
              <Link to="/dashboard/users" onClick={() => setIsOpen(false)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Manage User Roles
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
