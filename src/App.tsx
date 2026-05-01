import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { A11yProvider } from "@/contexts/A11yContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import StubPage from "./pages/StubPage.tsx";
import Programs from "./pages/Programs.tsx";
import Governance from "./pages/Governance.tsx";
import Media from "./pages/Media.tsx";
import SurveysPage from "./pages/Surveys.tsx";
import SurveyResults from "./pages/SurveyResults.tsx";
import About from "./pages/About.tsx";
import EServicesIndex from "./pages/eservices/EServicesIndex.tsx";
import VolunteerService from "./pages/eservices/VolunteerService.tsx";
import MembershipService from "./pages/eservices/MembershipService.tsx";
import Contact from "./pages/Contact.tsx";

// Admin
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.tsx";
import AdminNewsPage from "./pages/admin/AdminNewsPage.tsx";
import AdminProgramsPage from "./pages/admin/AdminProgramsPage.tsx";
import AdminBoardPage from "./pages/admin/AdminBoardPage.tsx";
import AdminPartnersPage from "./pages/admin/AdminPartnersPage.tsx";
import AdminHeroPage from "./pages/admin/AdminHeroPage.tsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.tsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.tsx";
import { ProtectedAdminRoute } from "./components/admin/ProtectedAdminRoute.tsx";

const queryClient = new QueryClient();

const Stub = ({ titleKey, pageKey }: { titleKey: keyof ReturnType<typeof useLanguage>["t"]["nav"] | "donate" | "search" | "privacy" | "terms" | "cookies" | "accessibility" | "sitemap" | "admin"; pageKey: string }) => {
  const { t } = useLanguage();
  const map: Record<string, string> = {
    about: t.nav.about,
    programs: t.nav.programs,
    governance: t.nav.governance,
    media: t.nav.media,
    volunteer: t.nav.volunteer,
    surveys: t.nav.surveys,
    contact: t.nav.contact,
    donate: t.nav.donate,
    search: t.nav.search,
    privacy: t.footer.privacy,
    terms: t.footer.terms,
    cookies: t.footer.cookies,
    accessibility: t.footer.accessibility,
    sitemap: t.footer.sitemap,
    admin: "Admin",
  };
  return <StubPage titleKey={map[titleKey] ?? titleKey} pageKey={pageKey} />;
};

const PublicRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/governance" element={<Governance />} />
      <Route path="/media" element={<Media />} />
      <Route path="/e-services" element={<EServicesIndex />} />
      <Route path="/e-services/volunteer" element={<VolunteerService />} />
      <Route path="/e-services/membership" element={<MembershipService />} />
      <Route path="/surveys" element={<SurveysPage />} />
      <Route path="/surveys/:surveyId/results" element={<SurveyResults />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/donate" element={<Stub titleKey="donate" pageKey="donate" />} />
      <Route path="/search" element={<Stub titleKey="search" pageKey="search" />} />
      <Route path="/privacy-policy" element={<Stub titleKey="privacy" pageKey="privacy" />} />
      <Route path="/terms-of-use" element={<Stub titleKey="terms" pageKey="terms" />} />
      <Route path="/cookie-policy" element={<Stub titleKey="cookies" pageKey="cookies" />} />
      <Route path="/accessibility-statement" element={<Stub titleKey="accessibility" pageKey="accessibility" />} />
      <Route path="/sitemap" element={<Stub titleKey="sitemap" pageKey="sitemap" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <A11yProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Admin routes — standalone, no public Layout */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/news"
                element={
                  <ProtectedAdminRoute>
                    <AdminNewsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/programs"
                element={
                  <ProtectedAdminRoute>
                    <AdminProgramsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/board"
                element={
                  <ProtectedAdminRoute>
                    <AdminBoardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/partners"
                element={
                  <ProtectedAdminRoute>
                    <AdminPartnersPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/hero"
                element={
                  <ProtectedAdminRoute>
                    <AdminHeroPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedAdminRoute requireAdmin>
                    <AdminSettingsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedAdminRoute requireAdmin>
                    <AdminUsersPage />
                  </ProtectedAdminRoute>
                }
              />

              {/* Public site (catch-all) */}
              <Route path="/*" element={<PublicRoutes />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </A11yProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
