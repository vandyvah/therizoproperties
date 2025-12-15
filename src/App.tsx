import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/components/currency/CurrencySwitcher";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import OurStandard from "./pages/OurStandard";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Properties from "./pages/Properties";
import Vault from "./pages/Vault";
import StyleGuide from "./pages/StyleGuide";
import NotFound from "./pages/NotFound";
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/our-standard" element={<OurStandard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/vault" element={<Vault />} />
              <Route path="/style-guide" element={<StyleGuide />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard/auth" element={<DashboardAuth />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/properties" element={<PropertiesList />} />
              <Route path="/dashboard/properties/:id" element={<PropertyDetail />} />
              <Route path="/dashboard/leads" element={<LeadsList />} />
              <Route path="/dashboard/clients" element={<ClientsList />} />
              <Route path="/dashboard/viewings" element={<ViewingsList />} />
              <Route path="/dashboard/deals" element={<DealsList />} />
              <Route path="/dashboard/roi" element={<ROIList />} />
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
