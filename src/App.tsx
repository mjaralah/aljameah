import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { A11yProvider } from "@/contexts/A11yContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import StubPage from "./pages/StubPage.tsx";
import SitemapPage from "./pages/SitemapPage.tsx";
import Programs from "./pages/Programs.tsx";
import Governance from "./pages/Governance.tsx";
import Media from "./pages/Media.tsx";
import Gallery from "./pages/Gallery.tsx";
import NewsDetail from "./pages/NewsDetail.tsx";
import SurveysPage from "./pages/Surveys.tsx";
import SurveyResults from "./pages/SurveyResults.tsx";
import About from "./pages/About.tsx";
import EServicesIndex from "./pages/eservices/EServicesIndex.tsx";
import VolunteerService from "./pages/eservices/VolunteerService.tsx";
import MembershipService from "./pages/eservices/MembershipService.tsx";
import Contact from "./pages/Contact.tsx";
import { PublicRouteGuard } from "@/components/layout/PublicRouteGuard";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { usePublicContentRealtime } from "@/hooks/usePublicContent";

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
import AdminPagesPage from "./pages/admin/AdminPagesPage.tsx";
import AdminGovernancePage from "./pages/admin/AdminGovernancePage.tsx";
import AdminVolunteerRequestsPage from "./pages/admin/AdminVolunteerRequestsPage.tsx";
import AdminMembershipRequestsPage from "./pages/admin/AdminMembershipRequestsPage.tsx";
import AdminContactMessagesPage from "./pages/admin/AdminContactMessagesPage.tsx";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage.tsx";
import AdminAboutPage from "./pages/admin/AdminAboutPage.tsx";
import AdminSurveysPage from "./pages/admin/AdminSurveysPage.tsx";
import AdminLegalPagesPage from "./pages/admin/AdminLegalPagesPage.tsx";
import AdminFooterPage from "./pages/admin/AdminFooterPage.tsx";
import AdminPageContentPage from "./pages/admin/AdminPageContentPage.tsx";
import AdminMediaCenterPage from "./pages/admin/AdminMediaCenterPage.tsx";
import AdminFormsPage from "./pages/admin/AdminFormsPage.tsx";
import AdminEmailTemplatesPage from "./pages/admin/AdminEmailTemplatesPage.tsx";
import AdminPageBuilderPage from "./pages/admin/AdminPageBuilderPage.tsx";
import AdminHelpCenterPage from "./pages/admin/AdminHelpCenterPage.tsx";
import AdminSupportPage from "./pages/admin/AdminSupportPage.tsx";
import Support from "./pages/Support.tsx";
import CustomFormPage from "./pages/eservices/CustomFormPage.tsx";
import CustomPage from "./pages/CustomPage.tsx";
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
      <Route path="/" element={<PublicRouteGuard pageKey="home"><Index /></PublicRouteGuard>} />
      <Route path="/about" element={<PublicRouteGuard pageKey="about"><About /></PublicRouteGuard>} />
      <Route path="/programs" element={<PublicRouteGuard pageKey="programs"><Programs /></PublicRouteGuard>} />
      <Route path="/governance" element={<PublicRouteGuard pageKey="governance"><Governance /></PublicRouteGuard>} />
      <Route path="/media" element={<PublicRouteGuard pageKey="media"><Media /></PublicRouteGuard>} />
      <Route path="/media/:slug" element={<PublicRouteGuard pageKey="media"><NewsDetail /></PublicRouteGuard>} />
      <Route path="/gallery" element={<PublicRouteGuard pageKey="gallery"><Gallery /></PublicRouteGuard>} />
      <Route path="/e-services" element={<PublicRouteGuard pageKey="eservices"><EServicesIndex /></PublicRouteGuard>} />
      <Route path="/e-services/volunteer" element={<PublicRouteGuard pageKey="eservices"><VolunteerService /></PublicRouteGuard>} />
      <Route path="/e-services/membership" element={<PublicRouteGuard pageKey="eservices"><MembershipService /></PublicRouteGuard>} />
      <Route path="/e-services/form/:slug" element={<PublicRouteGuard pageKey="eservices"><CustomFormPage /></PublicRouteGuard>} />
      <Route path="/surveys" element={<PublicRouteGuard pageKey="surveys"><SurveysPage /></PublicRouteGuard>} />
      <Route path="/surveys/:surveyId/results" element={<PublicRouteGuard pageKey="surveys"><SurveyResults /></PublicRouteGuard>} />
      <Route path="/contact" element={<PublicRouteGuard pageKey="contact"><Contact /></PublicRouteGuard>} />
      <Route path="/support" element={<Support />} />
      <Route path="/help" element={<Support />} />
      <Route path="/donate" element={<Stub titleKey="donate" pageKey="donate" />} />
      <Route path="/search" element={<Stub titleKey="search" pageKey="search" />} />
      <Route path="/privacy-policy" element={<Stub titleKey="privacy" pageKey="privacy" />} />
      <Route path="/terms-of-use" element={<Stub titleKey="terms" pageKey="terms" />} />
      <Route path="/cookie-policy" element={<Stub titleKey="cookies" pageKey="cookies" />} />
      <Route path="/accessibility-statement" element={<Stub titleKey="accessibility" pageKey="accessibility" />} />
      <Route path="/sitemap" element={<PublicRouteGuard pageKey="sitemap"><SitemapPage /></PublicRouteGuard>} />
      <Route path="/p/:slug" element={<CustomPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

const RealtimeSync = () => {
  usePublicContentRealtime();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <A11yProvider>
        <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RealtimeSync />
            <ScrollToTop />
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
                path="/admin/media-center"
                element={
                  <ProtectedAdminRoute>
                    <AdminMediaCenterPage />
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
              <Route
                path="/admin/email-templates"
                element={
                  <ProtectedAdminRoute requireAdmin>
                    <AdminEmailTemplatesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/pages"
                element={
                  <ProtectedAdminRoute>
                    <AdminPagesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/governance"
                element={
                  <ProtectedAdminRoute>
                    <AdminGovernancePage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/volunteer-requests"
                element={
                  <ProtectedAdminRoute>
                    <AdminVolunteerRequestsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/membership-requests"
                element={
                  <ProtectedAdminRoute>
                    <AdminMembershipRequestsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/contact-messages"
                element={
                  <ProtectedAdminRoute>
                    <AdminContactMessagesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/feedback"
                element={
                  <ProtectedAdminRoute>
                    <AdminFeedbackPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/about"
                element={
                  <ProtectedAdminRoute>
                    <AdminAboutPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/surveys"
                element={
                  <ProtectedAdminRoute>
                    <AdminSurveysPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/legal-pages"
                element={
                  <ProtectedAdminRoute>
                    <AdminLegalPagesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/footer"
                element={
                  <ProtectedAdminRoute>
                    <AdminFooterPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/page-content"
                element={
                  <ProtectedAdminRoute>
                    <AdminPageContentPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/forms"
                element={
                  <ProtectedAdminRoute>
                    <AdminFormsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/page-builder/:pageId"
                element={
                  <ProtectedAdminRoute>
                    <AdminPageBuilderPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/help-center"
                element={
                  <ProtectedAdminRoute requireAdmin>
                    <AdminHelpCenterPage />
                  </ProtectedAdminRoute>
                }
              />

              {/* Public site (catch-all) */}
              <Route path="/*" element={<PublicRoutes />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </SiteSettingsProvider>
      </A11yProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
