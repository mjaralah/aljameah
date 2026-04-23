import { useEffect, useRef, useState } from "react";
import { Award, HandHeart, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// عدّاد رقمي متحرّك يبدأ عند ظهور العنصر
const Counter = ({ value, duration = 1600 }: { value: number; duration?: number }) => {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            setN(Math.floor(p * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{n.toLocaleString()}</span>;
};

export const StatsCounters = () => {
  const { t } = useLanguage();
  const stats = [
    { icon: Users, value: 24500, label: t.stats.beneficiaries },
    { icon: Sparkles, value: 32, label: t.stats.programs },
    { icon: HandHeart, value: 1250, label: t.stats.volunteers },
    { icon: Award, value: 12, label: t.stats.years },
  ];
  return (
    <section className="container -mt-16 relative z-10" aria-label="stats">
      <div className="rounded-2xl bg-card shadow-card border border-border p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center mb-3 shadow-soft">
              <s.icon className="h-7 w-7" />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-primary">
              <Counter value={s.value} />+
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};