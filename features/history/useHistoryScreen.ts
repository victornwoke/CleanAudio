import { useEffect, useMemo, useState } from "react";

import { listProjectHistories } from "@/features/history/historyCatalog";
import type { MediaType } from "@/types/library";
import type { ProjectHistory } from "@/types/history";

export type HistoryFilter = "all" | MediaType;

export function useHistoryScreen() {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<ProjectHistory[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");

  useEffect(() => {
    let active = true;
    listProjectHistories()
      .then((result) => { if (active) { setItems(result); setStatus("loaded"); } })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, []);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return items
      .filter(({ project }) => filter === "all" || project.mediaType === filter)
      .filter(({ project }) => !normalized || project.displayName.toLocaleLowerCase().includes(normalized))
      .sort((a, b) => Date.parse(b.project.createdAt) - Date.parse(a.project.createdAt));
  }, [filter, items, query]);

  return { status, visibleItems, query, setQuery, filter, setFilter };
}
