import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemFormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface SystemForm {
  id: string;
  title: string;
  description: string | null;
  success_message: string | null;
  published: boolean;
  archived: boolean;
  fields: SystemFormField[];
}

/**
 * يجلب النموذج النظامي (volunteer/membership/contact) من جدول custom_forms
 * ليتمكن المدير من تعديل العناوين والأسئلة من لوحة التحكم.
 */
export function useSystemForm(key: "volunteer" | "membership" | "contact") {
  return useQuery({
    queryKey: ["system-form", key],
    queryFn: async () => {
      const { data } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("is_system", key)
        .maybeSingle();
      return (data as unknown as SystemForm) ?? null;
    },
  });
}

/** يبحث عن تسمية حقل معينة من النموذج النظامي مع قيمة افتراضية */
export function fieldLabel(form: SystemForm | null | undefined, key: string, fallback: string) {
  const f = form?.fields?.find((x) => x.key === key);
  return f?.label || fallback;
}
