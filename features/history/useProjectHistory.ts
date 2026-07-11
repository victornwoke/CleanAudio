import { useCallback, useEffect, useRef, useState } from "react";

import { getProjectHistory, renameHistoryProject } from "@/features/history/historyCatalog";
import { useProjectStore } from "@/store/useProjectStore";
import type { ProjectHistory } from "@/types/history";

export type ProjectHistoryStatus = "loading" | "loaded" | "not_found" | "error";

export function useProjectHistory(projectId: string) {
  const [status, setStatus] = useState<ProjectHistoryStatus>("loading");
  const [history, setHistory] = useState<ProjectHistory | null>(null);
  const generation = useRef(0);
  const upsert = useProjectStore((state) => state.upsert);

  const load = useCallback(async () => {
    const request = ++generation.current;
    await Promise.resolve();
    if (request !== generation.current) return;
    setStatus("loading");
    try {
      const result = await getProjectHistory(projectId);
      if (request !== generation.current) return;
      setHistory(result);
      setStatus(result ? "loaded" : "not_found");
    } catch {
      if (request !== generation.current) return;
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    void load();
    return () => { generation.current += 1; };
  }, [load]);

  const rename = useCallback(async (id: string, name: string) => {
    const project = useProjectStore.getState().projects.find((item) => item.id === id);
    if (project && name.trim()) await upsert({ ...project, displayName: name.trim() });
    const updated = await renameHistoryProject(id, name);
    if (updated) setHistory(updated);
  }, [upsert]);

  return { status, history, reload: load, rename };
}
