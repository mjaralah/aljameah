// عرض HTML آمن — يمرّ بـ DOMPurify لمنع XSS
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
};

export function SafeHtml({ html, className }: Props) {
  const clean = DOMPurify.sanitize(html ?? "", {
    ADD_ATTR: ["target", "rel"],
  });
  return (
    <div
      className={cn("prose prose-lg max-w-none text-foreground leading-loose", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export default SafeHtml;
