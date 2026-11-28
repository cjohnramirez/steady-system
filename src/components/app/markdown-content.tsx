import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders inline bold (`**text**`) and italic (`*text*`) tokens safely as React nodes
 * without `dangerouslySetInnerHTML`.
 */
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={key++} className="text-foreground font-medium">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/**
 * Lightweight, XSS-safe Markdown renderer for Steady articles.
 * Supports headings (`## `), bullet lists (`- `), numbered lists (`1. `),
 * blockquotes (`> `), and inline `**bold**` / `*italic*` formatting.
 */
export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i++;
      continue;
    }

    // Headings (`## ` or `# `)
    if (line.startsWith("## ") || line.startsWith("# ")) {
      const headingText = line.replace(/^#{1,3}\s+/, "");
      blocks.push(
        <h3
          key={key++}
          className="text-foreground pt-2 text-[17px] leading-snug font-medium"
        >
          {renderInline(headingText)}
        </h3>,
      );
      i++;
      continue;
    }

    // Blockquotes (`> `)
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().replace(/^>\s+/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-primary/40 bg-muted/40 text-foreground/90 rounded-r-[12px] border-l-2 px-4 py-2.5 text-[15px] leading-relaxed italic"
        >
          {quoteLines.map((ql, idx) => (
            <p key={idx}>{renderInline(ql)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    // Unordered list (`- ` or `* `)
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul
          key={key++}
          className="text-foreground/85 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list (`1. `)
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol
          key={key++}
          className="text-foreground/85 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Regular paragraph (group contiguous non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s+|>\s+|[-*]\s+|\d+\.\s+)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="text-foreground/85 text-[15px] leading-relaxed">
        {renderInline(paraLines.join(" "))}
      </p>,
    );
  }

  return <div className={cn("space-y-3.5", className)}>{blocks}</div>;
}
