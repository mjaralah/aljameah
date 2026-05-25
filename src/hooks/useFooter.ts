// Hooks for footer sections + links (public read + admin mutations)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBFooterSection = {
  id: string;
  section_key: string;
  title_ar: string | null;
  title_en: string | null;
  sort_order: number;
  published: boolean;
};

export type DBFooterLink = {
  id: string;
  section_key: string;
  label_ar: string;
  label_en: string | null;
  url: string;
  sort_order: number;
  published: boolean;
};

const STALE = 0;

// ============ Public ============
export function useFooterSections() {
  return useQuery({
    queryKey: ["public", "footer_sections"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_sections" as any)
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return ((data as any) ?? []) as DBFooterSection[];
    },
  });
}

export function useFooterLinks() {
  return useQuery({
    queryKey: ["public", "footer_links"],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_links" as any)
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return ((data as any) ?? []) as DBFooterLink[];
    },
  });
}

// ============ Admin ============
export function useAdminFooterSections() {
  return useQuery({
    queryKey: ["admin", "footer_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_sections" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return ((data as any) ?? []) as DBFooterSection[];
    },
  });
}

export function useAdminFooterLinks(sectionKey?: string) {
  return useQuery({
    queryKey: ["admin", "footer_links", sectionKey ?? "all"],
    queryFn: async () => {
      let q = supabase.from("footer_links" as any).select("*").order("sort_order", { ascending: true });
      if (sectionKey) q = q.eq("section_key", sectionKey);
      const { data, error } = await q;
      if (error) throw error;
      return ((data as any) ?? []) as DBFooterLink[];
    },
  });
}

export function useFooterMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "footer_sections"], refetchType: "all" });
    qc.invalidateQueries({ queryKey: ["admin", "footer_links"], refetchType: "all" });
    qc.invalidateQueries({ queryKey: ["public", "footer_sections"], refetchType: "all" });
    qc.invalidateQueries({ queryKey: ["public", "footer_links"], refetchType: "all" });
  };

  return {
    updateSection: useMutation({
      mutationFn: async (p: { id: string; patch: Partial<DBFooterSection> }) => {
        const { error } = await supabase.from("footer_sections" as any).update(p.patch).eq("id", p.id);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    reorderSections: useMutation({
      mutationFn: async (ids: string[]) => {
        await Promise.all(
          ids.map((id, i) =>
            supabase.from("footer_sections" as any).update({ sort_order: (i + 1) * 10 }).eq("id", id),
          ),
        );
      },
      onSuccess: invalidate,
    }),
    createLink: useMutation({
      mutationFn: async (row: Partial<DBFooterLink>) => {
        const { error } = await supabase.from("footer_links" as any).insert(row as any);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    updateLink: useMutation({
      mutationFn: async (p: { id: string; patch: Partial<DBFooterLink> }) => {
        const { error } = await supabase.from("footer_links" as any).update(p.patch).eq("id", p.id);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    deleteLink: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("footer_links" as any).delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    reorderLinks: useMutation({
      mutationFn: async (ids: string[]) => {
        await Promise.all(
          ids.map((id, i) =>
            supabase.from("footer_links" as any).update({ sort_order: (i + 1) * 10 }).eq("id", id),
          ),
        );
      },
      onSuccess: invalidate,
    }),
  };
}
