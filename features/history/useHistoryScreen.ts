import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { listProjectHistories } from "@/features/history/historyCatalog";
import type { MediaType } from "@/types/library";
import type { ProjectHistory } from "@/types/history";

export type HistoryFilter = "all" | MediaType;

export function useHistoryScreen() {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<ProjectHistory[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const generation = useRef(0);

  const reload = useCallback(async () => {
    const request = ++generation.current;
    setStatus("loading");
    try {
      const result = await listProjectHistories();
      if (request === generation.current) { setItems(result); setStatus("loaded"); }
    } catch { if (request === generation.current) setStatus("error"); }
  }, []);

  useEffect(() => { void reload(); return () => { generation.current += 1; }; }, [reload]);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return items
      .filter(({ project }) => filter === "all" || project.mediaType === filter)
      .filter(({ project }) => !normalized || project.displayName.toLocaleLowerCase().includes(normalized))
      .sort((a, b) => Date.parse(b.project.createdAt) - Date.parse(a.project.createdAt));
  }, [filter, items, query]);

  return { status, visibleItems, query, setQuery, filter, setFilter, reload };
}
