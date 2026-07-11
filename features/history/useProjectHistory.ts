import { useCallback, useEffect, useState } from "react";

import { getProjectHistory, renameHistoryProject } from "@/features/history/historyCatalog";
import type { ProjectHistory } from "@/types/history";

export type ProjectHistoryStatus = "loading" | "loaded" | "not_found" | "error";

export function useProjectHistory(projectId: string) {
  const [status, setStatus] = useState<ProjectHistoryStatus>("loading");
  const [history, setHistory] = useState<ProjectHistory | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await getProjectHistory(projectId);
      setHistory(result);
      setStatus(result ? "loaded" : "not_found");
    } catch {
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const rename = useCallback(async (id: string, name: string) => {
    const updated = await renameHistoryProject(id, name);
    if (updated) setHistory(updated);
  }, []);

  return { status, history, reload: load, rename };
}
