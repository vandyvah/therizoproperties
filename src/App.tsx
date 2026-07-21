import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/components/currency/CurrencySwitcher";
import { ScrollManager } from "@/components/ScrollManager";
import { URLNormalizer } from "@/components/URLNormalizer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Eager routes: high-traffic public pages (fast first paint on nav)
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetailPage from "./pages/PropertyDetail";
import Contact from "./pages/Contact";
import CalculatorLead from "./pages/CalculatorLead";
import NotFound from "./pages/NotFound";

// Lazy routes: split into separate chunks to shrink initial bundle
const Calculator = lazy(() => import("./pages/Calculator"));
const OurStandard = lazy(() => import("./pages/OurStandard"));
const Team = lazy(() => import("./pages/Team"));
const Vault = lazy(() => import("./pages/Vault"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const ReportFraud = lazy(() => import("./pages/ReportFraud"));
const Press = lazy(() => import("./pages/Press"));
const TitleVerification = lazy(() => import("./pages/guides/TitleVerification"));
const BuyerGuide = lazy(() => import("./pages/guides/BuyerGuide"));
const ROIMethodology = lazy(() => import("./pages/guides/ROIMethodology"));
const Lagos = lazy(() => import("./pages/locations/Lagos"));
const Abuja = lazy(() => import("./pages/locations/Abuja"));
const PortHarcourt = lazy(() => import("./pages/locations/PortHarcourt"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCluster = lazy(() => import("./pages/BlogCluster"));
const SEOHealth = lazy(() => import("./pages/SEOHealth"));
const MaterialsSupply = lazy(() => import("./pages/MaterialsSupply"));
const AbujaStarterKit = lazy(() => import("./pages/AbujaStarterKit"));
const OwnerBrief = lazy(() => import("./pages/owner/OwnerBrief"));
const SubmitProperty = lazy(() => import("./pages/owner/SubmitProperty"));
const OwnerAdmin = lazy(() => import("./pages/owner/OwnerAdmin"));
const OwnerPrivacy = lazy(() => import("./pages/owner/OwnerPrivacy"));
const OwnerTerms = lazy(() => import("./pages/owner/OwnerTerms"));

// Dashboard bundle (staff-only; heavy, deferred)
const DashboardAuth = lazy(() => import("./pages/dashboard/DashboardAuth"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const PropertiesList = lazy(() => import("./pages/dashboard/PropertiesList"));
const PropertyDetail = lazy(() => import("./pages/dashboard/PropertyDetail"));
const LeadsList = lazy(() => import("./pages/dashboard/LeadsList"));
const ClientsList = lazy(() => import("./pages/dashboard/ClientsList"));
const ViewingsList = lazy(() => import("./pages/dashboard/ViewingsList"));
const DealsList = lazy(() => import("./pages/dashboard/DealsList"));
const ROIList = lazy(() => import("./pages/dashboard/ROIList"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const UserManagement = lazy(() => import("./pages/dashboard/UserManagement"));
const BlogPostsList = lazy(() => import("./pages/dashboard/BlogPostsList"));
const BlogPostEdit = lazy(() => import("./pages/dashboard/BlogPostEdit"));
const BlogClustersList = lazy(() => import("./pages/dashboard/BlogClustersList"));
const MaterialRequestsList = lazy(() => import("./pages/dashboard/MaterialRequestsList"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div
    role="status"
    aria-label="Loading"
    style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        border: "3px solid rgba(8,26,47,0.15)",
        borderTopColor: "#081A2F",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <ScrollManager />
            <URLNormalizer />
            <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calculator" element={<CalculatorLead />} />
                <Route path="/calculator/advanced" element={<Calculator />} />
                <Route path="/our-standard" element={<OurStandard />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/press" element={<Press />} />
                <Route path="/materials-supply" element={<MaterialsSupply />} />
                <Route path="/abuja-starter-kit" element={<AbujaStarterKit />} />
                <Route path="/style-guide" element={<StyleGuide />} />
                <Route path="/seo-health" element={<SEOHealth />} />
                <Route path="/report-fraud" element={<ReportFraud />} />

                {/* Guide Pages */}
                <Route path="/guides/title-verification" element={<TitleVerification />} />
                <Route path="/guides/buyer-guide" element={<BuyerGuide />} />
                <Route path="/guides/roi-methodology" element={<ROIMethodology />} />

                {/* Location Pages */}
                <Route path="/locations/lagos" element={<Lagos />} />
                <Route path="/locations/abuja" element={<Abuja />} />
                <Route path="/locations/port-harcourt" element={<PortHarcourt />} />

                {/* Blog Pages */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/blog/cluster/:slug" element={<BlogCluster />} />

                {/* Owner Briefing Routes */}
                <Route path="/owner-brief" element={<OwnerBrief />} />
                <Route path="/submit-property" element={<SubmitProperty />} />
                <Route path="/admin" element={<OwnerAdmin />} />
                <Route path="/privacy" element={<OwnerPrivacy />} />
                <Route path="/terms" element={<OwnerTerms />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard/auth" element={<DashboardAuth />} />
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/dashboard/properties" element={<PropertiesList />} />
                <Route path="/dashboard/properties/:id" element={<PropertyDetail />} />
                <Route path="/dashboard/properties/:id/edit" element={<PropertyDetail />} />
                <Route path="/dashboard/leads" element={<LeadsList />} />
                <Route path="/dashboard/clients" element={<ClientsList />} />
                <Route path="/dashboard/viewings" element={<ViewingsList />} />
                <Route path="/dashboard/deals" element={<DealsList />} />
                <Route path="/dashboard/roi" element={<ROIList />} />
                <Route path="/dashboard/blog" element={<BlogPostsList />} />
                <Route path="/dashboard/blog/new" element={<BlogPostEdit />} />
                <Route path="/dashboard/blog/:id/edit" element={<BlogPostEdit />} />
                <Route path="/dashboard/blog/clusters" element={<BlogClustersList />} />
                <Route path="/dashboard/material-requests" element={<MaterialRequestsList />} />

                <Route path="/dashboard/users" element={<UserManagement />} />
                <Route path="/dashboard/settings" element={<Settings />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
