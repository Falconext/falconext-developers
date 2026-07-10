/**
 * Navegación de las páginas GLOBALES del portal (cross-product), que viven bajo /docs:
 * SDKs, integraciones, sandbox, herramientas y soporte. NO es la doc de un producto —
 * la documentación por producto/versión se deriva del registry (src/config/products.ts)
 * y del contenido MDX (content/<producto>/<versión>/), no de aquí.
 */

export type NavLink = {
  title: string;
  href: string;
  badge?: string;
  keywords?: string[];
};

export type NavGroup = {
  title: string;
  icon?: string;
  items: NavLink[];
};

export const docsNav: NavGroup[] = [
  {
    title: "Herramientas",
    icon: "Package",
    items: [
      { title: "SDKs", href: "/docs/sdk", keywords: ["javascript", "typescript", "php", "python", "java", "go", "node", "laravel", ".net"] },
      { title: "Sandbox", href: "/docs/sandbox", badge: "Live", keywords: ["playground", "probar", "try it"] },
      { title: "Postman", href: "/docs/postman", keywords: ["colección", "collection", "import"] },
      { title: "Integraciones", href: "/docs/integraciones", keywords: ["sap", "odoo", "shopify", "vtex", "mercadolibre"] },
    ],
  },
  {
    title: "Ayuda",
    icon: "BookOpen",
    items: [
      { title: "Estado del servicio", href: "/docs/estado", keywords: ["status", "uptime", "incidentes"] },
      { title: "FAQ", href: "/docs/faq", keywords: ["preguntas", "dudas"] },
      { title: "Soporte técnico", href: "/docs/soporte", keywords: ["ayuda", "contacto", "help"] },
    ],
  },
];

/** Lista plana en orden de lectura, para prev/next y para sembrar el buscador. */
export function flatNav(): NavLink[] {
  return docsNav.flatMap((g) => g.items);
}

export function findNavNeighbors(pathname: string) {
  const flat = flatNav();
  const idx = flat.findIndex((i) => i.href === pathname);
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
    current: idx >= 0 ? flat[idx] : null,
  };
}

export function findBreadcrumbs(pathname: string): { title: string; href: string }[] {
  for (const group of docsNav) {
    const item = group.items.find((i) => i.href === pathname);
    if (item) {
      return [
        { title: "Herramientas", href: docsNav[0].items[0].href },
        { title: group.title, href: group.items[0].href },
        { title: item.title, href: item.href },
      ];
    }
  }
  return [{ title: "Herramientas", href: docsNav[0].items[0].href }];
}
