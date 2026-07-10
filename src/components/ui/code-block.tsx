import { highlightCode } from "@/lib/highlight";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

const langLabels: Record<string, string> = {
  bash: "Terminal",
  json: "JSON",
  javascript: "JavaScript",
  typescript: "TypeScript",
  tsx: "TSX",
  php: "PHP",
  python: "Python",
  java: "Java",
  csharp: "C#",
  go: "Go",
  http: "HTTP",
  yaml: "YAML",
  sql: "SQL",
};

export async function CodeBlock({
  code,
  lang = "bash",
  filename,
  showLineNumbers = false,
  className,
  hideHeader = false,
}: {
  code: string;
  lang?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  hideHeader?: boolean;
}) {
  const html = await highlightCode(code, lang);

  return (
    <figure
      className={cn(
        "group relative my-6 overflow-hidden rounded-card border border-app",
        className,
      )}
      style={{ backgroundColor: "var(--bg-code)" }}
    >
      {!hideHeader && (
        <figcaption className="flex items-center justify-between border-b border-app px-4 py-2">
          <span className="font-mono text-[0.72rem] text-muted">
            {filename ?? langLabels[lang] ?? lang}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-wider text-subtle">
              {langLabels[lang] ?? lang}
            </span>
            <CopyButton value={code} />
          </div>
        </figcaption>
      )}
      {hideHeader && (
        <CopyButton
          value={code}
          className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
      <div
        className={cn("overflow-x-auto px-4 py-3.5 text-sm", showLineNumbers && "code-numbers")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
