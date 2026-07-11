import type { AudioProject } from "@/types/audio";

const projects = new Map<string, AudioProject>();

export function handoffExportProject(project: AudioProject): void {
  projects.set(project.id, { ...project });
}

export function getExportProject(projectId: string): AudioProject | null {
  const project = projects.get(projectId);
  return project ? { ...project } : null;
}
