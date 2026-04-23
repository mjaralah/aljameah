// أنواع البيانات المشتركة عبر المشروع
export type Lang = "ar" | "en";

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface NewsArticle {
  id: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  date: string; // ISO
  image: string;
  category: LocalizedText;
}

export interface Program {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string; // اسم أيقونة lucide
  category: "education" | "health" | "relief" | "social" | "youth" | "family";
  beneficiaries: number;
}

export interface BoardMember {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
}

export interface Partner {
  id: string;
  name: LocalizedText;
  logo?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  skills: string[];
  joinedAt: string;
}

export interface ContactMessage {
  id: string;
  ticket: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "new" | "in_progress" | "closed";
}

export type SurveyQuestionType =
  | "single"
  | "multiple"
  | "rating"
  | "likert"
  | "text";

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  question: LocalizedText;
  options?: LocalizedText[];
  required?: boolean;
}

export interface Survey {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  status: "active" | "closed";
  endsAt: string;
  participants: number;
  questions: SurveyQuestion[];
  results?: Record<string, unknown>;
}

export interface PolicyDoc {
  id: string;
  title: LocalizedText;
  year: number;
  fileName: string;
}