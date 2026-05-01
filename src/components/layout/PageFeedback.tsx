import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// أداة تقييم الصفحة — تُرسل التقييم إلى قاعدة البيانات
export const PageFeedback = ({ pageKey }: { pageKey: string }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const submit = (val: "yes" | "no") => {
    setVote(val);
    if (val === "yes") {
      persist(val, "");
      setDone(true);
    }
  };

  const persist = async (val: "yes" | "no", c: string) => {
    try {
      await supabase.from("page_feedback").insert({
        page_path: location.pathname || `/${pageKey}`,
        helpful: val === "yes",
        comment: c || null,
      });
    } catch {
      /* تجاهل */
    }
  };

  return (
    <section aria-label="page-feedback" className="container my-12">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft text-center">
        {done ? (
          <p className="font-semibold text-primary">{t.feedback.thanks}</p>
        ) : vote === "no" ? (
          <div className="max-w-xl mx-auto space-y-3">
            <p className="font-semibold">{t.feedback.title}</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.feedback.placeholder}
              rows={3}
            />
            <Button
              onClick={() => {
                persist("no", comment);
                setDone(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              {t.feedback.send}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="font-semibold">{t.feedback.title}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => submit("yes")} className="gap-2 hover:bg-success/10 hover:text-success hover:border-success">
                <ThumbsUp className="h-4 w-4" /> {t.feedback.yes}
              </Button>
              <Button variant="outline" onClick={() => submit("no")} className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive">
                <ThumbsDown className="h-4 w-4" /> {t.feedback.no}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};