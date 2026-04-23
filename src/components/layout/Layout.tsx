import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopBar } from "./TopBar";
import { AccessibilityToolbar } from "./AccessibilityToolbar";
import { useLanguage } from "@/contexts/LanguageContext";

// التخطيط الموحّد لكل الصفحات
export const Layout = ({ children }: { children: ReactNode }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-accent focus:text-accent-foreground focus:px-3 focus:py-2 focus:rounded-md"
      >
        {t.nav.skipToContent}
      </a>
      <TopBar />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <AccessibilityToolbar />
    </div>
  );
};