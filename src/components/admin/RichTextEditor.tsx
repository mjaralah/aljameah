// محرر نصوص غني (TipTap) — RTL، شريط أدوات بسيط، إخراج HTML آمن
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Undo2, Redo2, Eraser,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
};

const Btn = ({
  active, onClick, title, children, disabled,
}: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={cn(
      "h-8 w-8 inline-flex items-center justify-center rounded-md text-sm transition-colors",
      "hover:bg-muted text-foreground/80",
      active && "bg-muted text-foreground font-semibold",
      disabled && "opacity-40 cursor-not-allowed",
    )}
  >
    {children}
  </button>
);

const Toolbar = ({ editor }: { editor: Editor }) => {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("رابط (URL):", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank", rel: "noopener noreferrer" }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
      <Btn title="عريض" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
      <Btn title="مائل" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
      <Btn title="مشطوب" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
      <div className="w-px h-5 bg-border mx-1" />
      <Btn title="عنوان كبير" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
      <Btn title="عنوان فرعي" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
      <div className="w-px h-5 bg-border mx-1" />
      <Btn title="قائمة نقطية" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
      <Btn title="قائمة مرقمة" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
      <Btn title="اقتباس" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
      <div className="w-px h-5 bg-border mx-1" />
      <Btn title="رابط" active={editor.isActive("link")} onClick={setLink}><LinkIcon className="h-4 w-4" /></Btn>
      <Btn title="إزالة التنسيق" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser className="h-4 w-4" /></Btn>
      <div className="flex-1" />
      <Btn title="تراجع" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
      <Btn title="إعادة" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
    </div>
  );
};

export function RichTextEditor({ value, onChange, placeholder = "ابدأ الكتابة هنا...", minHeight = 200, className }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir: "rtl",
        class: cn(
          "tiptap prose prose-sm max-w-none focus:outline-none px-3 py-2 leading-relaxed",
          "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground",
          "prose-a:text-primary prose-blockquote:border-r-4 prose-blockquote:border-l-0 prose-blockquote:pr-4 prose-blockquote:pl-0",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // مزامنة عند تغيير القيمة خارجياً (مثل التحميل من DB)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) editor.commands.setContent(value, { emitUpdate: false });
    if (!value && current && current !== "<p></p>") editor.commands.clearContent(false);
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn("rounded-md border border-input bg-background overflow-hidden", className)}>
      <Toolbar editor={editor} />
      <div style={{ minHeight }} className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .tiptap ul, .tiptap ol { padding-inline-start: 1.5rem; }
        .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .tiptap h3 { font-size: 1.1rem; font-weight: 700; margin: 0.6rem 0 0.4rem; }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
