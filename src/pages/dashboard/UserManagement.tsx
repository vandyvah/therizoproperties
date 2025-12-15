import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, Shield, ShieldCheck, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string | null;
  active: boolean;
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  spc: "SPC (Consultant)",
  support: "Support",
};

const roleIcons: Record<string, React.ReactNode> = {
  super_admin: <ShieldCheck className="h-4 w-4 text-gold" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  spc: <User className="h-4 w-4 text-green-500" />,
  support: <Users className="h-4 w-4 text-purple-500" />,
};

export default function UserManagement() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (profileError) throw profileError;

      // Fetch roles
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("*");

      if (roleError) throw roleError;

      // Merge data
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);
      const usersWithRoles: UserWithRole[] = (profiles || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        role: roleMap.get(p.user_id) || null,
        active: p.active,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: UserWithRole, newRole: string) => {
    setSelectedUser(user);
    setSelectedRole(newRole);
    setConfirmDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.rpc("set_user_role", {
        target_user_id: selectedUser.user_id,
        new_role: selectedRole as "admin" | "spc" | "support" | "super_admin",
      });

      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: selectedRole } : u
        )
      );

      toast({
        title: "Role Updated",
        description: `${selectedUser.full_name} is now ${roleLabels[selectedRole] || selectedRole}`,
      });

      setConfirmDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline">No Role</Badge>;

    const variants: Record<string, "default" | "secondary" | "outline"> = {
      super_admin: "default",
      admin: "secondary",
      spc: "outline",
      support: "outline",
    };

    return (
      <Badge variant={variants[role] || "outline"} className="flex items-center gap-1 w-fit">
        {roleIcons[role]}
        {roleLabels[role] || role}
      </Badge>
    );
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Access denied. Super Admin only.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and access permissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  {users.length} registered user{users.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "default" : "outline"}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role !== "super_admin" && (
                          <>
                            {user.role !== "admin" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(user, "admin")}
                              >
                                Make Admin
                              </Button>
                            )}
                            {user.role !== "spc" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(user, "spc")}
                              >
                                Make SPC
                              </Button>
                            )}
                            {user.role && user.role !== "support" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRoleChange(user, "support")}
                              >
                                Demote
                              </Button>
                            )}
                          </>
                        )}
                        {user.role === "super_admin" && (
                          <span className="text-xs text-muted-foreground">
                            Cannot modify
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Role Change</DialogTitle>
              <DialogDescription>
                Are you sure you want to change {selectedUser?.full_name}'s role
                to {roleLabels[selectedRole] || selectedRole}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Current Role</p>
                  {getRoleBadge(selectedUser?.role || null)}
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">New Role</p>
                  {getRoleBadge(selectedRole)}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={confirmRoleChange} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Confirm Change"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}