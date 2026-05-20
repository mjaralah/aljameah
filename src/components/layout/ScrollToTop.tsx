import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// يُعيد التمرير إلى أعلى الصفحة عند تغيّر المسار، ما لم يحتوِ الرابط على hash مستهدف
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
};
