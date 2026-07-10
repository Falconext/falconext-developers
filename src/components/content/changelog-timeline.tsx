import { Badge } from "@/components/ui/badge";
import { changelog, changeMeta } from "@/config/changelog";

/** Línea de tiempo del changelog embebible en MDX. Deriva de config/changelog.ts. */
export function ChangelogTimeline() {
  return (
    <div className="relative my-8 border-l border-app pl-6">
      {changelog.map((entry) => (
        <article key={entry.version} className="relative mb-12 last:mb-0">
          <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-violet-500 bg-app" />
          <div className="mb-3 flex flex-wrap items-baseline gap-3">
            <h2 className="scroll-mt-24 font-mono text-lg font-semibold text-fg">{entry.version}</h2>
            <time className="text-[0.78rem] text-subtle">
              {new Date(entry.date).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
          <ul className="space-y-2.5">
            {entry.changes.map((change, i) => {
              const meta = changeMeta[change.type];
              return (
                <li key={i} className="flex items-start gap-3">
                  <Badge tone={meta.tone} className="mt-0.5 shrink-0">{meta.label}</Badge>
                  <span className="text-sm leading-relaxed text-muted">{change.text}</span>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </div>
  );
}
