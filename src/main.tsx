import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyCachedBrand } from "./lib/applyCachedBrand";

// تطبيق ألوان الهوية المخزّنة فوراً قبل أول رسم لمنع وميض الثيم الافتراضي
applyCachedBrand();

createRoot(document.getElementById("root")!).render(<App />);
