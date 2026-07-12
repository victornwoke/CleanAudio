export function canUseExportOption(requiresPro: boolean, entitlement: "free" | "pro"): boolean {
  return !requiresPro || entitlement === "pro";
}
