import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Bell } from "lucide-react";

export default function Settings() {
  const { profile, role, isAdmin, user } = useAuth();

  return (
    <DashboardLayout>
      <SEOHead title="Settings" description="Account and preferences" noindex={true} />
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="font-medium">{profile?.full_name || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium">{user?.email || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="font-medium">{profile?.phone || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p>
                  <Badge variant={profile?.active ? "default" : "secondary"}>
                    {profile?.active ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permissions
            </CardTitle>
            <CardDescription>Your access level in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Current Role</label>
              <p className="font-medium capitalize mt-1">
                <Badge variant="outline" className="text-base">
                  {role === "admin"
                    ? "Administrator (CEO)"
                    : role === "spc"
                    ? "Senior Property Consultant"
                    : role === "support"
                    ? "Support Staff"
                    : "No Role Assigned"}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Permissions</label>
              <ul className="space-y-2 text-sm">
                {isAdmin ? (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Full access to all properties, leads, and deals
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Can approve properties for listing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Can manage user roles and permissions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Access to all KPIs and reports
                    </li>
                  </>
                ) : role === "spc" ? (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Create and manage your own properties
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Create and manage your own leads and clients
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Read-only access to other consultants' listings
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      Cannot approve properties (requires admin)
                    </li>
                  </>
                ) : (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Contact your administrator to get a role assigned
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Notification preferences coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification settings will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
