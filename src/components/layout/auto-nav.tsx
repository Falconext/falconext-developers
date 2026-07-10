"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";
import { DocsPager } from "./pager";
import { findBreadcrumbs, findNavNeighbors } from "@/config/navigation";

export function AutoBreadcrumbs() {
  const pathname = usePathname();
  return <Breadcrumbs items={findBreadcrumbs(pathname)} />;
}

export function AutoPager() {
  const pathname = usePathname();
  const { prev, next } = findNavNeighbors(pathname);
  return <DocsPager prev={prev} next={next} />;
}
