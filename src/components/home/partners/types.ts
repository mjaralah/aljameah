export type PartnerItem = {
  id: string | number;
  name: string;
  logo?: string;
  url?: string;
};

export type PartnersDisplayStyle = "swiper" | "marquee" | "grid" | "bento" | "coverflow";

export const PARTNERS_DISPLAY_OPTIONS: { value: PartnersDisplayStyle; label: string }[] = [
  { value: "swiper", label: "كاروسيل تلقائي (افتراضي)" },
  { value: "marquee", label: "شريط لانهائي" },
  { value: "grid", label: "شبكة ثابتة" },
  { value: "bento", label: "شبكة Bento متدرجة" },
  { value: "coverflow", label: "كاروسيل ثلاثي الأبعاد" },
];
