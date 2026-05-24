// React Query hooks لجلب المحتوى العام من قاعدة البيانات
// يستخدم في الصفحات العامة (الرئيسية، الأخبار، البرامج، الحوكمة...)
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBHeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
};

export type DBNews = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
};

export type DBProgram = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  icon: string | null;
  cover_image_url: string | null;
  sort_order: number;
  featured?: boolean;
};

export type DBPartner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

export type DBBoardMember = {
  id: string;
  full_name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  term_duration: string | null;
};

export type DBBoardSettings = {
  id: string;
  intro_text: string | null;
  term_duration_label: string | null;
  term_end_hijri: string | null;
  term_end_gregorian: string | null;
  show_hijri: boolean;
  show_gregorian: boolean;
  formation_decree_url: string | null;
  formation_decree_name: string | null;
};

export type DBGovernanceDoc = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string;
  file_size: number | null;
  sort_order: number;
};

export type DBSiteSettings = {
  id: string;
  site_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  social_youtube: string | null;
  footer_text: string | null;
  feedback_visibility: Record<string, boolean> | null;
  pages_visibility: Record<string, boolean> | null;
  whatsapp_enabled: boolean | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  whatsapp_tooltip: string | null;
  whatsapp_show_tooltip: boolean | null;
  whatsapp_position: string | null;
};

const STALE = 1000 * 60 * 2; // 2 دقيقة

export function useHeroSlides() {
  return useQuery({
    queryKey: ["public", "hero_slides"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBHeroSlide[];
    },
  });
}

export function useNews() {
  return useQuery({
    queryKey: ["public", "news"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DBNews[];
    },
  });
}

export function usePrograms() {
  return useQuery({
    queryKey: ["public", "programs"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBProgram[];
    },
  });
}

export function usePartners() {
  return useQuery({
    queryKey: ["public", "partners"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBPartner[];
    },
  });
}

export function useBoardSettings() {
  return useQuery({
    queryKey: ["public", "board_settings"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data as DBBoardSettings | null;
    },
  });
}

export function useBoardMembers() {
  return useQuery({
    queryKey: ["public", "board_members"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_members")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBBoardMember[];
    },
  });
}

export function useGovernanceDocs() {
  return useQuery({
    queryKey: ["public", "governance_documents"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_documents")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBGovernanceDoc[];
    },
  });
}

export type DBGovernanceCategory = {
  id: string;
  slug: string;
  label_ar: string;
  label_en: string;
  icon: string | null;
  sort_order: number;
  published: boolean;
};

export function useGovernanceCategories() {
  return useQuery({
    queryKey: ["public", "governance_categories"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_categories")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBGovernanceCategory[];
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["public", "site_settings"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as DBSiteSettings | null;
    },
  });
}

export type DBAboutSection = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  data: any;
  sort_order: number;
};

export function useAboutContent() {
  return useQuery({
    queryKey: ["public", "about_content"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBAboutSection[];
    },
  });
}

export type DBSurvey = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  ends_at: string | null;
  show_public_results: boolean;
  participants: number;
  sort_order: number;
};

export type DBSurveyQuestion = {
  id: string;
  survey_id: string;
  question: string;
  type: string;
  options: any;
  scale: any;
  required: boolean;
  sort_order: number;
};

export function useSurveys() {
  return useQuery({
    queryKey: ["public", "surveys"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*, survey_questions(*)")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (DBSurvey & { survey_questions: DBSurveyQuestion[] })[];
    },
  });
}

export type DBPageSection = {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  content: string | null;
  data: any;
  sort_order: number;
};

export function usePageContent(pageKey: string) {
  return useQuery({
    queryKey: ["public", "page_content", pageKey],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_key", pageKey)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBPageSection[];
    },
  });
}

export function useLegalPage(slug: string) {
  return useQuery({
    queryKey: ["public", "legal_pages", slug],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_pages")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; slug: string; title: string; content: string | null } | null;
    },
  });
}

// أقسام البلوكات المخصّصة لصفحة محدّدة (للصفحات النظامية مثل home)
export function useCustomBlocks(pageKey: string) {
  return useQuery({
    queryKey: ["public", "page_content_blocks", pageKey],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_key", pageKey)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      // فقط الأقسام التي تحمل block_type (الأقسام المخصّصة)
      return ((data ?? []) as any[]).filter((s) => s.data && s.data.block_type);
    },
  });
}

// قائمة الصفحات المخصّصة الظاهرة في القائمة العلوية
export function useMenuPages() {
  return useQuery({
    queryKey: ["public", "menu_pages"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_pages")
        .select("id,slug,title,title_en,parent_slug,sort_order")
        .eq("published", true)
        .eq("show_in_menu", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as { id: string; slug: string; title: string; title_en: string | null; parent_slug: string | null; sort_order: number }[];
    },
  });
}
