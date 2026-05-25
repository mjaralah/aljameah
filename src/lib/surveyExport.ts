// تصدير تقارير الاستبيانات (Excel + PDF) — يدعم العربية
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

type Survey = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  ends_at: string | null;
  participants: number;
};

type Question = {
  id: string;
  question: string;
  type: string;
  options: { ar?: string; en?: string }[] | null;
  scale: { ar?: string; en?: string }[] | null;
  sort_order: number;
};

type ResponseRow = {
  id: string;
  submitted_at: string;
  answers: Record<string, unknown>;
};

const LIKERT_TYPES = ["likert", "rating"];
const CHOICE_TYPES = ["single", "single_choice", "multiple", "dropdown"];

async function fetchData(surveyId: string) {
  const [{ data: survey }, { data: questions }, { data: responses }] = await Promise.all([
    supabase.from("surveys").select("*").eq("id", surveyId).maybeSingle(),
    supabase.from("survey_questions").select("*").eq("survey_id", surveyId).order("sort_order"),
    supabase.from("survey_responses").select("*").eq("survey_id", surveyId).order("submitted_at", { ascending: false }),
  ]);
  return {
    survey: survey as Survey | null,
    questions: (questions ?? []) as Question[],
    responses: (responses ?? []) as ResponseRow[],
  };
}

const scoreOf = (v: unknown) => {
  if (typeof v === "number") return v;
  const m = String(v ?? "").match(/[1-5]/);
  return m ? Number(m[0]) : 0;
};

function answerToText(q: Question, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.map((v) => answerToText(q, v)).join("، ");
  return String(value);
}

function buildSummary(questions: Question[], responses: ResponseRow[]) {
  const likert = questions.filter((q) => LIKERT_TYPES.includes(q.type));
  const allScores = responses.flatMap((r) => likert.map((q) => scoreOf(r.answers[q.id])).filter(Boolean));
  const avg = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
  return {
    totalResponses: responses.length,
    averageRating: Number(avg.toFixed(2)),
    satisfaction: Math.round((avg / 5) * 100),
    firstResponse: responses.length ? responses[responses.length - 1].submitted_at : null,
    lastResponse: responses.length ? responses[0].submitted_at : null,
  };
}

function buildQuestionStats(q: Question, responses: ResponseRow[]) {
  const values = responses.map((r) => r.answers[q.id]).filter((v) => v !== null && v !== undefined && v !== "");
  if (LIKERT_TYPES.includes(q.type)) {
    const scores = values.map(scoreOf).filter(Boolean);
    const dist = [1, 2, 3, 4, 5].map((n) => ({ label: `${n}`, count: scores.filter((s) => s === n).length }));
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { kind: "likert" as const, total: scores.length, average: Number(avg.toFixed(2)), dist };
  }
  if (CHOICE_TYPES.includes(q.type)) {
    const counts = new Map<string, number>();
    values.forEach((v) => {
      const arr = Array.isArray(v) ? v : [v];
      arr.forEach((item) => {
        const key = String(item);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
    return {
      kind: "choice" as const,
      total: values.length,
      dist: Array.from(counts.entries()).map(([label, count]) => ({
        label,
        count,
        percent: Math.round((count / total) * 100),
      })),
    };
  }
  return { kind: "text" as const, total: values.length, samples: values.slice(0, 20).map((v) => String(v)) };
}

/* ========== Excel ========== */
export async function exportSurveyExcel(surveyId: string) {
  const { survey, questions, responses } = await fetchData(surveyId);
  if (!survey) throw new Error("لم يتم العثور على الاستبيان");
  const summary = buildSummary(questions, responses);
  const wb = XLSX.utils.book_new();

  // ورقة 1: ملخص
  const summaryRows = [
    ["تقرير الاستبيان", survey.title],
    ["الوصف", survey.description ?? ""],
    ["الحالة", survey.status === "active" ? "نشط" : "مغلق"],
    ["تاريخ الانتهاء", survey.ends_at ?? "—"],
    [],
    ["إجمالي المشاركات", summary.totalResponses],
    ["متوسط التقييم (من 5)", summary.averageRating],
    ["نسبة الرضا %", summary.satisfaction],
    ["أول مشاركة", summary.firstResponse ?? "—"],
    ["آخر مشاركة", summary.lastResponse ?? "—"],
    ["تاريخ التصدير", new Date().toLocaleString("ar-SA")],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws1["!cols"] = [{ wch: 24 }, { wch: 60 }];
  if (!ws1["!sheetView"]) ws1["!sheetView"] = [];
  ws1["!sheetView"] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, ws1, "ملخص");

  // ورقة 2: تحليل لكل سؤال
  const analysisRows: (string | number)[][] = [["السؤال", "النوع", "إجمالي الإجابات", "الخيار/القيمة", "العدد", "النسبة %"]];
  questions.forEach((q, idx) => {
    const stats = buildQuestionStats(q, responses);
    const typeLabel = LIKERT_TYPES.includes(q.type) ? "مقياس" : CHOICE_TYPES.includes(q.type) ? "اختيار" : "نص";
    if (stats.kind === "likert") {
      analysisRows.push([`${idx + 1}. ${q.question}`, typeLabel, stats.total, `المتوسط: ${stats.average}`, "", ""]);
      stats.dist.forEach((d) => {
        const pct = stats.total ? Math.round((d.count / stats.total) * 100) : 0;
        analysisRows.push(["", "", "", d.label, d.count, pct]);
      });
    } else if (stats.kind === "choice") {
      analysisRows.push([`${idx + 1}. ${q.question}`, typeLabel, stats.total, "", "", ""]);
      stats.dist.forEach((d) => analysisRows.push(["", "", "", d.label, d.count, d.percent]));
    } else {
      analysisRows.push([`${idx + 1}. ${q.question}`, typeLabel, stats.total, "— إجابات نصية —", "", ""]);
    }
    analysisRows.push([]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(analysisRows);
  ws2["!cols"] = [{ wch: 50 }, { wch: 12 }, { wch: 16 }, { wch: 30 }, { wch: 10 }, { wch: 10 }];
  ws2["!sheetView"] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, ws2, "تحليل الأسئلة");

  // ورقة 3: كل الإجابات الخام
  const header = ["#", "تاريخ المشاركة", ...questions.map((q, i) => `Q${i + 1}: ${q.question}`)];
  const rawRows: (string | number)[][] = [header];
  responses.forEach((r, i) => {
    rawRows.push([
      i + 1,
      new Date(r.submitted_at).toLocaleString("ar-SA"),
      ...questions.map((q) => answerToText(q, r.answers[q.id])),
    ]);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(rawRows);
  ws3["!cols"] = [{ wch: 5 }, { wch: 22 }, ...questions.map(() => ({ wch: 28 }))];
  ws3["!sheetView"] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, ws3, "الإجابات");

  const safeName = survey.title.replace(/[\\/:*?"<>|]/g, "_");
  XLSX.writeFile(wb, `استبيان_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/* ========== PDF (عبر طباعة HTML — يدعم العربية بشكل طبيعي) ========== */
export async function exportSurveyPDF(surveyId: string) {
  const { survey, questions, responses } = await fetchData(surveyId);
  if (!survey) throw new Error("لم يتم العثور على الاستبيان");
  const summary = buildSummary(questions, responses);

  const esc = (s: unknown) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

  const questionsHtml = questions
    .map((q, idx) => {
      const stats = buildQuestionStats(q, responses);
      let body = "";
      if (stats.kind === "likert") {
        const max = Math.max(...stats.dist.map((d) => d.count), 1);
        body = `
          <div class="meta">المتوسط: <b>${stats.average}</b> من 5 · عدد الإجابات: <b>${stats.total}</b></div>
          <div class="bars">
            ${stats.dist.map((d) => `
              <div class="bar-row">
                <span class="bar-label">${d.label}</span>
                <div class="bar"><div class="bar-fill" style="width:${(d.count / max) * 100}%"></div></div>
                <span class="bar-count">${d.count}</span>
              </div>`).join("")}
          </div>`;
      } else if (stats.kind === "choice") {
        body = `
          <div class="meta">عدد الإجابات: <b>${stats.total}</b></div>
          <table class="dist">
            <thead><tr><th>الخيار</th><th>العدد</th><th>النسبة</th></tr></thead>
            <tbody>${stats.dist.map((d) => `<tr><td>${esc(d.label)}</td><td>${d.count}</td><td>${d.percent}%</td></tr>`).join("")}</tbody>
          </table>`;
      } else {
        body = `
          <div class="meta">عدد الإجابات النصية: <b>${stats.total}</b></div>
          <ul class="samples">${stats.samples.map((s) => `<li>${esc(s)}</li>`).join("") || "<li>—</li>"}</ul>`;
      }
      return `
        <section class="q">
          <h3>${idx + 1}. ${esc(q.question)}</h3>
          ${body}
        </section>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>تقرير: ${esc(survey.title)}</title>
<style>
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, "Geeza Pro", Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; line-height: 1.6; }
  header { border-bottom: 3px solid #0F766E; padding-bottom: 12px; margin-bottom: 18px; }
  h1 { color: #0F766E; margin: 0 0 4px; font-size: 22px; }
  .subtitle { color: #555; font-size: 13px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0 22px; }
  .stat { background: #f5f5f5; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e5e5e5; }
  .stat .v { font-size: 22px; font-weight: 700; color: #0F766E; }
  .stat .l { font-size: 11px; color: #666; margin-top: 4px; }
  h2 { color: #0F766E; font-size: 16px; margin: 24px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .q { page-break-inside: avoid; margin-bottom: 18px; padding: 10px 12px; background: #fafafa; border-radius: 6px; border: 1px solid #eee; }
  .q h3 { font-size: 14px; margin: 0 0 8px; color: #222; }
  .meta { font-size: 12px; color: #555; margin-bottom: 8px; }
  .bars { display: flex; flex-direction: column; gap: 4px; }
  .bar-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
  .bar-label { width: 16px; text-align: center; font-weight: 600; }
  .bar { flex: 1; height: 14px; background: #e5e5e5; border-radius: 3px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, #0F766E, #14b8a6); }
  .bar-count { width: 30px; text-align: left; font-variant-numeric: tabular-nums; }
  table.dist { width: 100%; border-collapse: collapse; font-size: 12px; }
  table.dist th, table.dist td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
  table.dist th { background: #0F766E; color: white; }
  .samples { margin: 0; padding-right: 18px; font-size: 12px; }
  .samples li { margin-bottom: 3px; }
  footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #888; text-align: center; }
  @media print { .no-print { display: none; } }
  .toolbar { position: fixed; top: 10px; left: 10px; background: #0F766E; color: white; padding: 8px 14px; border-radius: 6px; cursor: pointer; border: none; font-size: 13px; }
</style>
</head>
<body>
  <button class="toolbar no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  <header>
    <h1>تقرير الاستبيان</h1>
    <div class="subtitle"><b>${esc(survey.title)}</b>${survey.description ? " — " + esc(survey.description) : ""}</div>
  </header>

  <div class="stats">
    <div class="stat"><div class="v">${summary.totalResponses}</div><div class="l">إجمالي المشاركات</div></div>
    <div class="stat"><div class="v">${summary.averageRating}</div><div class="l">متوسط التقييم / 5</div></div>
    <div class="stat"><div class="v">${summary.satisfaction}%</div><div class="l">نسبة الرضا</div></div>
    <div class="stat"><div class="v">${questions.length}</div><div class="l">عدد الأسئلة</div></div>
  </div>

  <h2>تحليل الأسئلة</h2>
  ${questionsHtml || '<p style="color:#888">لا توجد أسئلة.</p>'}

  <footer>
    تم التوليد في ${esc(new Date().toLocaleString("ar-SA"))}
  </footer>

  <script>
    setTimeout(() => window.print(), 400);
  </script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) throw new Error("الرجاء السماح بالنوافذ المنبثقة لتصدير PDF");
  w.document.write(html);
  w.document.close();
}
