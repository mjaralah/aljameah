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

const queryClient = new QueryClient();

// مكوّن مساعد لإنشاء صفحات بديلة بعنوان مترجم
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <A11yProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<Stub titleKey="about" pageKey="about" />} />
                <Route path="/programs" element={<Stub titleKey="programs" pageKey="programs" />} />
                <Route path="/governance" element={<Stub titleKey="governance" pageKey="governance" />} />
                <Route path="/media" element={<Stub titleKey="media" pageKey="media" />} />
                <Route path="/volunteer" element={<Stub titleKey="volunteer" pageKey="volunteer" />} />
                <Route path="/surveys" element={<Stub titleKey="surveys" pageKey="surveys" />} />
                <Route path="/contact" element={<Stub titleKey="contact" pageKey="contact" />} />
                <Route path="/donate" element={<Stub titleKey="donate" pageKey="donate" />} />
                <Route path="/search" element={<Stub titleKey="search" pageKey="search" />} />
                <Route path="/privacy-policy" element={<Stub titleKey="privacy" pageKey="privacy" />} />
                <Route path="/terms-of-use" element={<Stub titleKey="terms" pageKey="terms" />} />
                <Route path="/cookie-policy" element={<Stub titleKey="cookies" pageKey="cookies" />} />
                <Route path="/accessibility-statement" element={<Stub titleKey="accessibility" pageKey="accessibility" />} />
                <Route path="/sitemap" element={<Stub titleKey="sitemap" pageKey="sitemap" />} />
                <Route path="/admin" element={<Stub titleKey="admin" pageKey="admin" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </A11yProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
