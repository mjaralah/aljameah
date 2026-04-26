import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Download, MessageSquareText, Star, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PageHero } from "@/components/layout/PageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import { surveys } from "@/data";
import { getAnonymousTextResponses, getChoiceDistribution, getLikertDistribution, getQuestionAverageData, getSurveyMetrics } from "@/lib/surveyResults";

const chartColors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

const SurveyResults = () => {
  const { surveyId } = useParams();
  const { t, tx, lang } = useLanguage();
  const survey = surveys.find((s) => s.id === surveyId);

  if (!survey) {
    return (
      <section className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">{lang === "ar" ? "الاستبيان غير موجود" : "Survey not found"}</h1>
        <Button asChild><Link to="/surveys">{t.pages.surveys.back}</Link></Button>
      </section>
    );
  }

  const metrics = getSurveyMetrics(survey);
  const choiceQuestion = survey.questions.find((q) => q.type === "dropdown") ?? survey.questions.find((q) => q.type === "single_choice" || q.type === "single");
  const pieData = choiceQuestion ? getChoiceDistribution(survey, choiceQuestion).map((item) => ({ name: tx(item.name), value: item.value })) : [];
  const averages = getQuestionAverageData(survey);
  const likert = getLikertDistribution(survey);
  const comments = getAnonymousTextResponses(survey);

  return (
    <>
      <PageHero
        eyebrow={lang === "ar" ? "النتائج والتقارير" : "Results & Insights"}
        title={tx(survey.title)}
        lead={lang === "ar" ? "لوحة قراءة عامة لنتائج الاستبيان ضمن بيانات تجريبية محفوظة محلياً." : "A public results dashboard using locally stored demo data."}
        breadcrumb={[{ label: t.nav.surveys, to: "/surveys" }, { label: lang === "ar" ? "النتائج" : "Results" }]}
      />

      <section className="container py-12 md:py-16 space-y-8">
        <div className="grid sm:grid-cols-3 gap-4">
          <Kpi Icon={Users} label={lang === "ar" ? "إجمالي المشاركين" : "Total participants"} value={metrics.participants.toLocaleString()} />
          <Kpi Icon={Star} label={lang === "ar" ? "متوسط التقييم" : "Average rating"} value={`${metrics.averageRating.toFixed(1)} / 5`} />
          <Kpi Icon={Star} label={lang === "ar" ? "نسبة الرضا" : "Satisfaction %"} value={`${metrics.satisfaction}%`} />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" className="border-primary text-primary min-h-11">
            <Download className="h-4 w-4" />
            {lang === "ar" ? "تصدير التقرير" : "Export report"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title={lang === "ar" ? "توزيع المشاركين" : "Participant distribution"}>
            <ChartContainer config={{ value: { label: lang === "ar" ? "العدد" : "Count" } }} className="h-72 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                  {pieData.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title={lang === "ar" ? "متوسط التقييم لكل محور" : "Average rating by item"}>
            <ChartContainer config={{ average: { label: lang === "ar" ? "المتوسط" : "Average", color: "hsl(var(--primary))" } }} className="h-72 w-full">
              <BarChart data={averages} margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="var(--color-average)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        <ChartCard title={lang === "ar" ? "تحليل مقياس ليكرت" : "Likert stacked analysis"}>
          <ChartContainer config={{ five: { label: "5", color: chartColors[0] }, four: { label: "4", color: chartColors[1] }, three: { label: "3", color: chartColors[2] }, two: { label: "2", color: chartColors[3] }, one: { label: "1", color: chartColors[4] } }} className="h-80 w-full">
            <BarChart data={likert} layout="vertical" margin={{ top: 12, right: 16, left: 16, bottom: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="question" type="category" tickLine={false} axisLine={false} width={48} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="five" stackId="a" fill="var(--color-five)" radius={[0, 6, 6, 0]} />
              <Bar dataKey="four" stackId="a" fill="var(--color-four)" />
              <Bar dataKey="three" stackId="a" fill="var(--color-three)" />
              <Bar dataKey="two" stackId="a" fill="var(--color-two)" />
              <Bar dataKey="one" stackId="a" fill="var(--color-one)" radius={[6, 0, 0, 6]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-primary mb-5 flex items-center gap-2"><MessageSquareText className="h-5 w-5" />{lang === "ar" ? "آخر 10 ردود نصية مجهولة" : "Last 10 anonymous text responses"}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {comments.map((comment, index) => <div key={index} className="rounded-lg border border-border bg-muted/40 p-4 text-sm font-semibold text-foreground">{comment}</div>)}
          </div>
        </Card>
      </section>
    </>
  );
};

const Kpi = ({ Icon, label, value }: { Icon: React.FC<{ className?: string }>; label: string; value: string }) => (
  <Card className="p-5">
    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4"><Icon className="h-5 w-5" /></div>
    <p className="text-xs font-bold text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-extrabold text-primary tabular-nums">{value}</p>
  </Card>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-5 md:p-6">
    <h2 className="text-lg font-bold text-primary mb-5">{title}</h2>
    {children}
  </Card>
);

export default SurveyResults;