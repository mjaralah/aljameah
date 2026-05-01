import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, ClipboardList, Star, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { surveys } from "@/data";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import type { Survey } from "@/types";
import { cn } from "@/lib/utils";
import { getSurveyMetrics, saveSurveyResponse } from "@/lib/surveyResults";

const SurveysPage = () => {
  const { t, tx, lang, dir } = useLanguage();
  const [selected, setSelected] = useState<Survey | null>(null);

  if (selected) return <SurveyTaker survey={selected} onBack={() => setSelected(null)} />;

  const surveysCount = surveys.length;
  const reportsCount = surveys.filter((s) => s.showPublicResults || s.results).length;

  return (
    <>
      <PageHero
        eyebrow={t.nav.surveys}
        title={t.pages.surveys.heading}
        lead={t.pages.surveys.lead}
        breadcrumb={[{ label: t.nav.surveys }]}
      />
      <section className="container py-12 md:py-16">
        <Tabs defaultValue="surveys" className="w-full">
          <div className="mb-8 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList
              className={cn(
                "h-auto w-full md:w-auto inline-flex gap-1 rounded-2xl border border-border bg-card/80 p-1.5 shadow-soft backdrop-blur",
              )}
            >
              <TabsTrigger
                value="surveys"
                className={cn(
                  "group flex-1 md:flex-none gap-2 rounded-xl px-4 md:px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all",
                  "data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card",
                  "hover:text-primary",
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span className="whitespace-nowrap">
                  {lang === "ar" ? "الاستبيانات المتاحة" : "Available surveys"}
                </span>
                <Badge
                  className={cn(
                    "ms-1 border-0 bg-muted text-foreground font-bold tabular-nums",
                    "group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground",
                  )}
                >
                  {surveysCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className={cn(
                  "group flex-1 md:flex-none gap-2 rounded-xl px-4 md:px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all",
                  "data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card",
                  "hover:text-primary",
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="whitespace-nowrap">
                  {lang === "ar" ? "النتائج والتقارير" : "Results & reports"}
                </span>
                <Badge
                  className={cn(
                    "ms-1 border-0 bg-muted text-foreground font-bold tabular-nums",
                    "group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground",
                  )}
                >
                  {reportsCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="surveys" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
          {surveys.map((s) => {
            const isActive = s.status === "active";
             const hasResults = s.showPublicResults || s.results;
             const metrics = hasResults ? getSurveyMetrics(s) : null;
            return (
              <Card key={s.id} className="p-6 hover:shadow-card transition-smooth border-border flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <Badge
                    className={cn(
                      "border-0 font-bold",
                      isActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isActive ? t.pages.surveys.active : t.pages.surveys.closed}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{tx(s.title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{tx(s.description)}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {s.participants.toLocaleString()} {t.pages.surveys.participants}
                  </span>
                  <span>
                    {t.pages.surveys.endsAt}:{" "}
                    <span className="font-semibold text-foreground">
                      {new Date(s.endsAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                    </span>
                  </span>
                </div>
                {isActive ? (
                  <Button onClick={() => setSelected(s)} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-gold">
                    {t.pages.surveys.take}
                    <ArrowLeft className={dir === "rtl" ? "h-4 w-4" : "h-4 w-4 rotate-180"} />
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="border-primary text-primary">
                    <Link to={`/surveys/${s.id}/results`}>
                    <Star className="h-4 w-4" fill="currentColor" />
                    {t.pages.surveys.viewResults}{s.results?.avgRating ? ` · ${s.results.avgRating}/5` : ""}
                    </Link>
                  </Button>
                )}
                {metrics && (
                  <div className="mt-5 border-t border-border pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-extrabold text-primary">{lang === "ar" ? "نتائج التقييم" : "Survey results"}</p>
                      <Badge className="border-0 bg-success/15 text-success font-bold">{metrics.satisfaction}%</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <Metric label={t.pages.surveys.participants} value={metrics.participants.toLocaleString()} />
                      <Metric label={lang === "ar" ? "متوسط الرضا" : "Avg. rating"} value={metrics.averageRating.toFixed(1)} />
                      <Metric label={lang === "ar" ? "نسبة الرضا" : "Satisfaction"} value={`${metrics.satisfaction}%`} />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
            </div>
          </TabsContent>
          <TabsContent value="reports" className="mt-0">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-primary">{lang === "ar" ? "النتائج والتقارير" : "Results & reports"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "ar" ? "ملخص مؤشرات الرضا وآخر الردود النصية للاستبيانات المنشورة." : "A summary of satisfaction indicators and recent anonymous text responses."}
                </p>
              </div>
              <Button variant="outline" className="border-primary text-primary font-bold">
                {lang === "ar" ? "تصدير التقرير" : "Export report"}
              </Button>
            </div>
            <div className="grid gap-6">
              {surveys.filter((s) => s.showPublicResults || s.results).map((s) => {
                const metrics = getSurveyMetrics(s);
                return (
                  <Card key={`${s.id}-report`} className="p-6 border-border shadow-soft">
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-primary">{tx(s.title)}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{tx(s.description)}</p>
                      </div>
                      <Badge className="w-fit border-0 bg-success/15 text-success font-bold">{metrics.satisfaction}%</Badge>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3 mb-6">
                      <Metric label={t.pages.surveys.participants} value={metrics.participants.toLocaleString()} />
                      <Metric label={lang === "ar" ? "متوسط الرضا" : "Avg. rating"} value={metrics.averageRating.toFixed(1)} />
                      <Metric label={lang === "ar" ? "نسبة الرضا" : "Satisfaction"} value={`${metrics.satisfaction}%`} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm font-bold text-primary">
                        <span>{lang === "ar" ? "مؤشر الرضا" : "Satisfaction indicator"}</span>
                        <span>{metrics.satisfaction}%</span>
                      </div>
                      <Progress value={metrics.satisfaction} className="h-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <PageFeedback pageKey="surveys" />
    </>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-muted/60 px-3 py-4">
    <p className="text-lg font-extrabold text-primary tabular-nums">{value}</p>
    <p className="text-[11px] font-semibold text-muted-foreground mt-1">{label}</p>
  </div>
);

// واجهة تعبئة الاستبيان
const SurveyTaker = ({ survey, onBack }: { survey: Survey; onBack: () => void }) => {
  const { t, tx, dir } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [done, setDone] = useState(false);

  const total = survey.questions.length;
  const q = survey.questions[step];
  const progress = ((step + (done ? 1 : 0)) / Math.max(1, total)) * 100;

  if (done) {
    return (
      <>
        <PageHero
          title={t.pages.surveys.heading}
          breadcrumb={[{ label: t.nav.surveys, to: "/surveys" }, { label: tx(survey.title) }]}
        />
        <section className="container py-16 md:py-20">
          <Card className="max-w-xl mx-auto p-10 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-success/15 text-success grid place-items-center mb-5">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-3">{t.pages.surveys.submitted}</h2>
            <p className="text-muted-foreground mb-6">{tx(survey.title)}</p>
            <Button onClick={onBack} className="bg-primary text-primary-foreground">{t.pages.surveys.back}</Button>
          </Card>
        </section>
      </>
    );
  }

  const setAnswer = (val: unknown) => setAnswers((a) => ({ ...a, [q.id]: val }));
  const canNext = !q.required || answers[q.id] !== undefined && answers[q.id] !== "";

  return (
    <>
      <PageHero
        title={tx(survey.title)}
        lead={tx(survey.description)}
        breadcrumb={[{ label: t.nav.surveys, to: "/surveys" }, { label: tx(survey.title) }]}
      />
      <section className="container py-12 md:py-16">
        <Card className="max-w-2xl mx-auto p-6 md:p-10">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span className="font-bold text-primary">
              {t.pages.surveys.step} {step + 1} {t.pages.surveys.of} {total}
            </span>
            <button onClick={onBack} className="hover:text-primary inline-flex items-center gap-1 font-semibold">
              {t.pages.surveys.back}
            </button>
          </div>
          <Progress value={progress} className="mb-7 h-2" />

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{tx(q.question)}</h2>
          {q.required && <p className="text-xs text-destructive mb-5">{t.pages.surveys.requiredHint}</p>}

          <div className="my-6">
            {q.type === "rating" && (
              <div className="flex gap-2 justify-center" role="radiogroup">
                {[1, 2, 3, 4, 5].map((n) => {
                  const sel = answers[q.id] === n;
                  return (
                    <button
                      key={n}
                      role="radio"
                      aria-checked={sel}
                      onClick={() => setAnswer(n)}
                      className={cn(
                        "h-14 w-14 rounded-2xl border-2 font-bold text-lg transition-smooth",
                        sel ? "bg-accent text-accent-foreground border-accent shadow-gold scale-110"
                            : "bg-card text-foreground border-border hover:border-accent",
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            )}
            {(q.type === "single" || q.type === "single_choice" || q.type === "multiple") && (
              <div className="grid gap-2">
                {q.options?.map((opt, i) => {
                  const label = tx(opt);
                  const cur = answers[q.id];
                  const sel = q.type === "single" ? cur === label : Array.isArray(cur) && cur.includes(label);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (q.type === "single") setAnswer(label);
                        else {
                          const arr = Array.isArray(cur) ? [...cur] : [];
                          const idx = arr.indexOf(label);
                          if (idx >= 0) arr.splice(idx, 1); else arr.push(label);
                          setAnswer(arr);
                        }
                      }}
                      className={cn(
                        "px-5 py-4 rounded-xl border-2 text-start font-semibold transition-smooth min-h-[56px]",
                        sel ? "bg-primary/5 border-primary text-primary"
                            : "bg-card border-border hover:border-primary/50",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === "dropdown" && (
              <Select value={(answers[q.id] as string) ?? ""} onValueChange={setAnswer}>
                <SelectTrigger className="min-h-[56px] text-start text-base font-semibold">
                  <SelectValue placeholder={t.pages.surveys.writeHere} />
                </SelectTrigger>
                <SelectContent>
                  {q.options?.map((opt, i) => <SelectItem key={i} value={tx(opt)}>{tx(opt)}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {q.type === "likert" && (
              <div className="grid gap-2" role="radiogroup">
                {q.scale?.map((opt, i) => {
                  const value = 5 - i;
                  const sel = answers[q.id] === value;
                  return (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={sel}
                      onClick={() => setAnswer(value)}
                      className={cn(
                        "min-h-[56px] px-5 py-4 rounded-xl border-2 text-start font-semibold transition-smooth",
                        sel ? "bg-accent text-accent-foreground border-accent shadow-gold" : "bg-card border-border hover:border-accent/70",
                      )}
                    >
                      {tx(opt)}
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === "text" && (
              <Textarea
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t.pages.surveys.writeHere}
                rows={5}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-5 border-t border-border">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowRight className={dir === "rtl" ? "h-4 w-4" : "h-4 w-4 rotate-180"} />
              {t.pages.surveys.prev}
            </Button>
            {step < total - 1 ? (
              <Button
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
                className="bg-primary text-primary-foreground"
              >
                {t.pages.surveys.next}
                <ArrowLeft className={dir === "rtl" ? "h-4 w-4" : "h-4 w-4 rotate-180"} />
              </Button>
            ) : (
              <Button
                disabled={!canNext}
                onClick={() => {
                  saveSurveyResponse({ id: `${survey.id}_${Date.now()}`, surveyId: survey.id, submittedAt: new Date().toISOString(), answers: answers as Record<string, string | number> });
                  setDone(true);
                }}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-gold"
              >
                {t.pages.surveys.submit}
              </Button>
            )}
          </div>
        </Card>
      </section>
    </>
  );
};

export default SurveysPage;
