import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { Link as LinkIcon } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { CodeGroup } from "@/components/ui/code-group";
import { Callout } from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";
import { LinkCard } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Steps, Step } from "@/components/content/steps";
import { WebhookCatalog } from "@/components/webhooks/webhook-catalog";
import { ChangelogTimeline } from "@/components/content/changelog-timeline";
import { SdkInstallTabs, CreateOrderExample } from "@/components/content/sdk-snippets";
import { DeliveryRail } from "@/components/brand/delivery-rail";
import { slugify } from "@/lib/utils";

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    // @ts-expect-error children shape
    return textOf(node.props?.children);
  }
  return "";
}

function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  const sizes = {
    2: "mt-12 mb-4 text-[1.5rem] font-semibold",
    3: "mt-9 mb-3 text-[1.2rem] font-semibold",
    4: "mt-7 mb-2 text-[1rem] font-semibold",
  }[level];
  return function Heading({ children }: { children?: React.ReactNode }) {
    const id = slugify(textOf(children));
    return (
      <Tag id={id} className={`group scroll-mt-24 text-fg ${sizes}`}>
        <a href={`#${id}`} className="relative no-underline">
          {children}
          <LinkIcon className="ml-2 inline-block h-4 w-4 -translate-y-0.5 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
      </Tag>
    );
  };
}

async function Pre({ children }: { children?: React.ReactElement }) {
  // MDX entrega <pre><code className="language-x">raw</code></pre>
  const props = (children?.props ?? {}) as { className?: string; children?: React.ReactNode; metastring?: string };
  const lang = (props.className ?? "").replace(/language-/, "") || "text";
  const raw = textOf(props.children).replace(/\n$/, "");
  const filename = props.metastring?.match(/title="([^"]+)"/)?.[1];
  return <CodeBlock code={raw} lang={lang} filename={filename} />;
}

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="mb-4 text-[2.15rem] font-bold leading-tight tracking-tight text-fg">{children}</h1>
  ),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  p: ({ children }) => <p className="my-4 leading-[1.75] text-muted">{children}</p>,
  a: ({ href = "#", children }) => {
    const external = href.startsWith("http");
    return (
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="font-medium text-violet-400 underline-offset-4 hover:underline"
      >
        {children}
      </Link>
    );
  },
  ul: ({ children }) => <ul className="my-4 ml-1 space-y-2 text-muted [&>li]:relative [&>li]:pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 ml-5 list-decimal space-y-2 text-muted marker:text-subtle">{children}</ol>,
  li: ({ children }) => (
    <li className="leading-relaxed before:absolute before:left-0 before:top-[0.65em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-violet-500/60 [ol_&]:before:hidden [ol_&]:pl-0">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-violet-500/40 pl-4 italic text-muted">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-app" />,
  code: ({ children }) => (
    <code className="rounded-md border border-app bg-elevated px-1.5 py-0.5 font-mono text-[0.82em] text-fg">
      {children}
    </code>
  ),
  pre: Pre as unknown as MDXComponents["pre"],
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-card border border-app">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-elevated">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-app px-4 py-2.5 text-left font-medium text-fg">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-app px-4 py-2.5 align-top text-muted">{children}</td>,
  // Componentes ricos disponibles dentro de cualquier .mdx
  Callout,
  Badge,
  LinkCard,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  CodeGroup,
  Steps,
  Step,
  WebhookCatalog,
  ChangelogTimeline,
  SdkInstallTabs,
  CreateOrderExample,
  DeliveryRail,
};
