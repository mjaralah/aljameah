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
