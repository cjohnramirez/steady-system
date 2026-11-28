"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pencil,
  Quote,
} from "lucide-react";
import { MarkdownContent } from "@/components/app/markdown-content";
import { cn } from "@/lib/utils";

type FormatAction = "bold" | "italic" | "heading" | "ul" | "ol" | "quote";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

const TOOLBAR_ITEMS: {
  action: FormatAction;
  label: string;
  icon: typeof Bold;
}[] = [
  { action: "bold", label: "Bold", icon: Bold },
  { action: "italic", label: "Italic", icon: Italic },
  { action: "heading", label: "Heading", icon: Heading2 },
  { action: "ul", label: "Bulleted list", icon: List },
  { action: "ol", label: "Numbered list", icon: ListOrdered },
  { action: "quote", label: "Blockquote", icon: Quote },
];

/**
 * Rich Markdown Editor with bottom formatting toolbar, live Preview toggle,
 * and bottom-right word counter (Figma 739:2215).
 */
export function MarkdownEditor({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Write your content here... Use the toolbar below for bold, italics, headings, or lists.",
  maxLength = 15000,
  rows = 9,
  invalid = false,
  className,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  invalid?: boolean;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const words = countWords(value);

  function applyFormat(action: FormatAction) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);

    let replacement = "";
    let cursorStart = start;
    let cursorEnd = end;

    if (action === "bold") {
      const inner = selected || "bold text";
      replacement = `**${inner}**`;
      cursorStart = start + 2;
      cursorEnd = start + 2 + inner.length;
    } else if (action === "italic") {
      const inner = selected || "italic text";
      replacement = `*${inner}*`;
      cursorStart = start + 1;
      cursorEnd = start + 1 + inner.length;
    } else if (action === "heading") {
      const inner = selected || "Section Heading";
      const prefix = start > 0 && value[start - 1] !== "\n" ? "\n## " : "## ";
      replacement = `${prefix}${inner}`;
      cursorStart = start + prefix.length;
      cursorEnd = cursorStart + inner.length;
    } else if (action === "ul") {
      const lines = (selected || "List item").split("\n");
      const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
      replacement = prefix + lines.map((l) => `- ${l}`).join("\n");
      cursorStart = start + prefix.length + 2;
      cursorEnd = start + replacement.length;
    } else if (action === "ol") {
      const lines = (selected || "First item").split("\n");
      const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
      replacement = prefix + lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
      cursorStart = start + prefix.length + 3;
      cursorEnd = start + replacement.length;
    } else {
      const lines = (selected || "Highlighted takeaway").split("\n");
      const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
      replacement = prefix + lines.map((l) => `> ${l}`).join("\n");
      cursorStart = start + prefix.length + 2;
      cursorEnd = start + replacement.length;
    }

    const next = value.slice(0, start) + replacement + value.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  return (
    <div
      className={cn(
        "border-border bg-card shadow-steady-card focus-within:border-ring focus-within:ring-ring/40 flex flex-col overflow-hidden rounded-[20px] border transition-[border-color,box-shadow] focus-within:ring-[3px]",
        invalid &&
          "border-destructive focus-within:border-destructive focus-within:ring-destructive/25",
        className,
      )}
    >
      {previewMode ? (
        <div className="min-h-[220px] px-5 pt-4 pb-3 text-left">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-muted-foreground text-[15px]">
              Nothing to preview yet.
            </p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={invalid}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="text-foreground placeholder:text-muted-foreground min-h-[220px] w-full resize-y bg-transparent px-5 pt-4 pb-3 text-[15px] leading-relaxed outline-none"
        />
      )}

      <div className="border-border/70 flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5">
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex items-center gap-1"
        >
          {!previewMode &&
            TOOLBAR_ITEMS.map(({ action, label, icon: Icon }) => (
              <button
                key={action}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => applyFormat(action)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              >
                <Icon strokeWidth={1.5} className="size-4" />
              </button>
            ))}
          <button
            type="button"
            onClick={() => setPreviewMode((p) => !p)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[13px] transition-colors"
          >
            {previewMode ? (
              <>
                <Pencil strokeWidth={1.5} className="size-3.5" />
                Write
              </>
            ) : (
              <>
                <Eye strokeWidth={1.5} className="size-3.5" />
                Preview
              </>
            )}
          </button>
        </div>

        <span className="text-muted-foreground text-[13px] tabular-nums">
          {words} {words === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
}
