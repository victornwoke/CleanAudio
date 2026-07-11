import type { ExportRequest, ExportResult } from "@/types/audioDomain";

export interface ExportService {
  export(request: ExportRequest): Promise<ExportResult>;
  cancel(idempotencyKey: string): Promise<void>;
  cleanupTemporaryFiles(projectId: string): Promise<void>;
}
