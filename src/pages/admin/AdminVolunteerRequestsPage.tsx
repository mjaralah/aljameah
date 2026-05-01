import { RequestsPage } from "@/components/admin/RequestsPage";

type VolunteerRequest = {
  id: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  full_name: string;
  id_number: string;
  gender: string | null;
  nationality: string | null;
  city: string | null;
  birth_date: string | null;
  marital_status: string | null;
  phone: string;
  education: string | null;
  skills: string | null;
  has_prior_experience: string | null;
  previous_org: string | null;
  job: string | null;
  employer: string | null;
  preferred_activities: string | null;
  volunteer_location: string | null;
  other_location: string | null;
  availability: string | null;
  referral_source: string | null;
};

export default function AdminVolunteerRequestsPage() {
  return (
    <RequestsPage<VolunteerRequest>
      table="volunteer_requests"
      title="طلبات التطوع"
      description="استقبال ومتابعة طلبات الانضمام لفريق المتطوعين"
      searchFields={["full_name", "phone", "id_number", "city"]}
      columns={[
        { key: "full_name", label: "الاسم" },
        { key: "phone", label: "الجوال" },
        { key: "city", label: "المدينة" },
        { key: "skills", label: "المهارات" },
      ]}
      detailFields={[
        { key: "full_name", label: "الاسم" },
        { key: "id_number", label: "رقم الهوية" },
        { key: "gender", label: "الجنس" },
        { key: "nationality", label: "الجنسية" },
        { key: "city", label: "مكان الإقامة" },
        { key: "birth_date", label: "تاريخ الميلاد" },
        { key: "marital_status", label: "الحالة الاجتماعية" },
        { key: "phone", label: "رقم الجوال" },
        { key: "education", label: "المؤهل العلمي" },
        { key: "skills", label: "المهارات" },
        { key: "has_prior_experience", label: "خبرة تطوعية سابقة" },
        { key: "previous_org", label: "الجهة السابقة" },
        { key: "job", label: "المسمى الوظيفي" },
        { key: "employer", label: "جهة العمل" },
        { key: "preferred_activities", label: "الأنشطة المفضلة" },
        { key: "volunteer_location", label: "مكان التطوع" },
        { key: "other_location", label: "مكان آخر" },
        { key: "availability", label: "وقت التوفر" },
        { key: "referral_source", label: "كيف عرفت عنا" },
      ]}
      csvHeaders={[
        { key: "full_name", label: "الاسم" },
        { key: "id_number", label: "الهوية" },
        { key: "phone", label: "الجوال" },
        { key: "gender", label: "الجنس" },
        { key: "city", label: "المدينة" },
        { key: "education", label: "المؤهل" },
        { key: "skills", label: "المهارات" },
        { key: "preferred_activities", label: "الأنشطة المفضلة" },
        { key: "availability", label: "التوفر" },
        { key: "status", label: "الحالة" },
        { key: "created_at", label: "تاريخ التقديم" },
      ]}
    />
  );
}
