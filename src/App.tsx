import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/components/currency/CurrencySwitcher";
import { ScrollManager } from "@/components/ScrollManager";
import { URLNormalizer } from "@/components/URLNormalizer";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import CalculatorLead from "./pages/CalculatorLead";
import OurStandard from "./pages/OurStandard";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Properties from "./pages/Properties";
import PropertyDetailPage from "./pages/PropertyDetail";
import Vault from "./pages/Vault";
import StyleGuide from "./pages/StyleGuide";
import NotFound from "./pages/NotFound";
import ReportFraud from "./pages/ReportFraud";
import Press from "./pages/Press";
import TitleVerification from "./pages/guides/TitleVerification";
import BuyerGuide from "./pages/guides/BuyerGuide";
import ROIMethodology from "./pages/guides/ROIMethodology";
import Lagos from "./pages/locations/Lagos";
import Abuja from "./pages/locations/Abuja";
import PortHarcourt from "./pages/locations/PortHarcourt";
import DashboardAuth from "./pages/dashboard/DashboardAuth";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PropertiesList from "./pages/dashboard/PropertiesList";
import PropertyDetail from "./pages/dashboard/PropertyDetail";
import LeadsList from "./pages/dashboard/LeadsList";
import ClientsList from "./pages/dashboard/ClientsList";
import ViewingsList from "./pages/dashboard/ViewingsList";
import DealsList from "./pages/dashboard/DealsList";
import ROIList from "./pages/dashboard/ROIList";
import Settings from "./pages/dashboard/Settings";
import UserManagement from "./pages/dashboard/UserManagement";
import BlogPostsList from "./pages/dashboard/BlogPostsList";
import BlogPostEdit from "./pages/dashboard/BlogPostEdit";
import BlogClustersList from "./pages/dashboard/BlogClustersList";
import MaterialRequestsList from "./pages/dashboard/MaterialRequestsList";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCluster from "./pages/BlogCluster";
import SEOHealth from "./pages/SEOHealth";
import MaterialsSupply from "./pages/MaterialsSupply";
import AbujaStarterKit from "./pages/AbujaStarterKit";
import OwnerBrief from "./pages/owner/OwnerBrief";
import SubmitProperty from "./pages/owner/SubmitProperty";
import OwnerAdmin from "./pages/owner/OwnerAdmin";
import OwnerPrivacy from "./pages/owner/OwnerPrivacy";
import OwnerTerms from "./pages/owner/OwnerTerms";

const queryClient = new QueryClient();

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
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
