export const BACKEND_ROUTES = {
  uploads: "POST /v1/uploads",
  enhancementJobs: "POST /v1/enhancement-jobs",
  enhancementJob: "GET /v1/enhancement-jobs/:id",
  cancelEnhancementJob: "POST /v1/enhancement-jobs/:id/cancel",
  projects: "GET /v1/projects",
  project: "GET /v1/projects/:id",
  patchProject: "PATCH /v1/projects/:id",
  deleteProject: "DELETE /v1/projects/:id",
  exports: "POST /v1/projects/:id/exports",
  deleteAccount: "POST /v1/account/delete",
  revenueCatWebhook: "POST /v1/revenuecat/webhook",
} as const;
