import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  HandshakeIcon,
  TrendingUp,
  Plus,
  Calendar,
  ClipboardList,
  Loader2,
  Mail,
} from "lucide-react";

interface KPIs {
  activeListings: number;
  underReview: number;
  activeLeads: number;
  dealsInProgress: number;
  dealsClosedThisMonth: number;
  totalCommissionThisMonth: number;
  newContactSubmissions?: number;
}

export default function DashboardHome() {
  const { profile, isAdmin, role } = useAuth();
  const [kpis, setKPIs] = useState<KPIs | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [profile, isAdmin]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Fetch KPIs
      const [
        { count: activeListings },
        { count: underReview },
        { count: activeLeads },
        { count: dealsInProgress },
        { data: closedDeals },
      ] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "listed"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "under_review"),
        supabase.from("leads").select("*", { count: "exact", head: true }).not("stage", "in", '("closed_won","closed_lost")'),
        supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
        supabase.from("deals").select("net_company_commission_ngn").eq("status", "closed").gte("closing_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);

      // Fetch contact submissions count for admins separately
      let newContactSubmissions = 0;
      if (isAdmin) {
        const { count } = await supabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "new");
        newContactSubmissions = count || 0;
      }

      const totalCommission = closedDeals?.reduce((sum, deal) => sum + (Number(deal.net_company_commission_ngn) || 0), 0) || 0;

      setKPIs({
        activeListings: activeListings || 0,
        underReview: underReview || 0,
        activeLeads: activeLeads || 0,
        dealsInProgress: dealsInProgress || 0,
        dealsClosedThisMonth: closedDeals?.length || 0,
        totalCommissionThisMonth: totalCommission,
        newContactSubmissions,
      });

      // Fetch recent activity - join with profiles table correctly
      const { data: activity } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      // Fetch profile names for activity entries
      if (activity && activity.length > 0) {
        const userIds = [...new Set(activity.map(a => a.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          
          const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
          activity.forEach(a => {
            (a as any).profile_name = profileMap.get(a.user_id) || "Unknown";
          });
        }
      }

      setRecentActivity(activity || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
      <SEOHead title="Dashboard" description="Therizo internal dashboard" noindex={true} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Welcome, {profile?.full_name?.split(" ")[0] || "User"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your dashboard overview for today
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/dashboard/leads/new">
                <Plus size={16} className="mr-2" />
                New Lead
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/properties/new">
                <Plus size={16} className="mr-2" />
                New Property
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Listings
              </CardTitle>
              <Building2 className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis?.activeListings}</div>
              <p className="text-xs text-muted-foreground mt-1">Properties listed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis?.underReview}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Leads
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis?.activeLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">In pipeline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deals In Progress
              </CardTitle>
              <HandshakeIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis?.dealsInProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">Active negotiations</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deals Closed This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis?.dealsClosedThisMonth}</div>
              <p className="text-lg font-semibold text-gold mt-1">
                {formatCurrency(kpis?.totalCommissionThisMonth || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Net company commission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/viewings">
                  <Calendar size={14} className="mr-2" />
                  Schedule Viewing
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/roi">
                  <TrendingUp size={14} className="mr-2" />
                  ROI Calculation
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/clients">
                  <Users size={14} className="mr-2" />
                  Add Client
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/deals">
                  <HandshakeIcon size={14} className="mr-2" />
                  Create Deal
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {(activity as any).profile_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{(activity as any).profile_name || "System"}</span>{" "}
                        {activity.description || activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {activity.entity_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
