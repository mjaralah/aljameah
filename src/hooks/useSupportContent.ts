import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SupportSettings = {
  page_title: string;
  page_subtitle: string;
  search_placeholder: string;
  contact_form_enabled: boolean;
  contact_form_title: string;
  quick_links_title: string;
  quick_links_enabled: boolean;
};

export type SupportCategory = {
  id: string;
  label: string;
  description: string | null;
  icon: string;
  color: string;
  link: string | null;
  sort_order: number;
  is_published: boolean;
};

export type SupportFaq = {
  id: string;
  category_id: string | null;
  question: string;
  answer: string;
  keywords: string[];
  sort_order: number;
  is_published: boolean;
};

export type SupportQuickLink = {
  id: string;
  label: string;
  description: string | null;
  url: string;
  icon: string;
  link_type: string;
  sort_order: number;
  is_published: boolean;
};

export function useSupportContent(opts: { publishedOnly?: boolean } = { publishedOnly: true }) {
  const [settings, setSettings] = useState<SupportSettings | null>(null);
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [faqs, setFaqs] = useState<SupportFaq[]>([]);
  const [quickLinks, setQuickLinks] = useState<SupportQuickLink[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, c, f, q] = await Promise.all([
      supabase.from("support_settings").select("*").eq("id", true).maybeSingle(),
      supabase.from("support_categories").select("*").order("sort_order"),
      supabase.from("support_faqs").select("*").order("sort_order"),
      supabase.from("support_quick_links").select("*").order("sort_order"),
    ]);
    if (s.data) setSettings(s.data as any);
    if (c.data) {
      const list = c.data as SupportCategory[];
      setCategories(opts.publishedOnly ? list.filter((x) => x.is_published) : list);
    }
    if (f.data) {
      const list = f.data as SupportFaq[];
      setFaqs(opts.publishedOnly ? list.filter((x) => x.is_published) : list);
    }
    if (q.data) {
      const list = q.data as SupportQuickLink[];
      setQuickLinks(opts.publishedOnly ? list.filter((x) => x.is_published) : list);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.publishedOnly]);

  return { settings, categories, faqs, quickLinks, loading, reload: load };
}
