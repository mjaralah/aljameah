import { RequestsPage } from "@/components/admin/RequestsPage";

type ContactMessage = {
  id: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  purpose: string | null;
  message: string;
};

const PURPOSE_LABEL: Record<string, string> = {
  inquiry: "استفسار عام",
  partnership: "شراكة وتعاون",
  complaint: "شكوى أو ملاحظة",
  donation: "استفسار عن التبرعات",
  media: "تواصل إعلامي",
  other: "أخرى",
};

export default function AdminContactMessagesPage() {
  return (
    <RequestsPage<ContactMessage>
      table="contact_messages"
      title="رسائل التواصل"
      description="الرسائل الواردة من نموذج اتصل بنا"
      searchFields={["full_name", "phone", "email", "message"]}
      columns={[
        { key: "full_name", label: "الاسم" },
        { key: "email", label: "البريد" },
        {
          key: "purpose",
          label: "الغرض",
          render: (r) => (r.purpose ? PURPOSE_LABEL[r.purpose] ?? r.purpose : "—"),
        },
      ]}
      detailFields={[
        { key: "full_name", label: "الاسم" },
        { key: "email", label: "البريد الإلكتروني" },
        { key: "phone", label: "رقم الجوال" },
        { key: "purpose", label: "الغرض", format: (v) => (v ? PURPOSE_LABEL[String(v)] ?? String(v) : "—") },
        { key: "message", label: "الرسالة" },
      ]}
      csvHeaders={[
        { key: "full_name", label: "الاسم" },
        { key: "email", label: "البريد" },
        { key: "phone", label: "الجوال" },
        { key: "purpose", label: "الغرض" },
        { key: "message", label: "الرسالة" },
        { key: "status", label: "الحالة" },
        { key: "created_at", label: "التاريخ" },
      ]}
    />
  );
}
