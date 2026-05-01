import { RequestsPage } from "@/components/admin/RequestsPage";

type MembershipRequest = {
  id: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  full_name: string;
  phone: string;
  gender: string | null;
  email: string;
  national_id: string;
  education: string | null;
  job_title: string | null;
  employer: string | null;
};

export default function AdminMembershipRequestsPage() {
  return (
    <RequestsPage<MembershipRequest>
      table="membership_requests"
      title="طلبات العضوية"
      description="استقبال ومتابعة طلبات الانتساب للجمعية"
      searchFields={["full_name", "phone", "email", "national_id"]}
      columns={[
        { key: "full_name", label: "الاسم" },
        { key: "email", label: "البريد" },
        { key: "phone", label: "الجوال" },
        { key: "education", label: "المؤهل" },
      ]}
      detailFields={[
        { key: "full_name", label: "الاسم" },
        { key: "national_id", label: "رقم الهوية" },
        { key: "gender", label: "الجنس" },
        { key: "email", label: "البريد الإلكتروني" },
        { key: "phone", label: "رقم الجوال" },
        { key: "education", label: "المؤهل العلمي" },
        { key: "job_title", label: "المسمى الوظيفي" },
        { key: "employer", label: "جهة العمل" },
      ]}
      csvHeaders={[
        { key: "full_name", label: "الاسم" },
        { key: "national_id", label: "الهوية" },
        { key: "email", label: "البريد" },
        { key: "phone", label: "الجوال" },
        { key: "education", label: "المؤهل" },
        { key: "job_title", label: "الوظيفة" },
        { key: "employer", label: "جهة العمل" },
        { key: "status", label: "الحالة" },
        { key: "created_at", label: "تاريخ التقديم" },
      ]}
    />
  );
}
