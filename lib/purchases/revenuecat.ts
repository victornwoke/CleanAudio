import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";

import type {
  SubscriptionEntitlementState,
  SubscriptionErrorCode,
  SubscriptionLifecycle,
  SubscriptionPackageInfo,
  SubscriptionPlanId,
} from "@/types/subscription";

/**
 * The entitlement identifier configured in the RevenueCat dashboard for
 * this project (test key `test_ydSn...`, per the integration request).
 * Update this single constant if the real dashboard project uses a
 * different identifier — every other file reads it from here rather than
 * repeating the literal string (`AGENTS.md` §5/§9).
 */
export const PRO_ENTITLEMENT_ID = "Clean Audio Pro";

/**
 * Single source of truth for the platform RevenueCat public SDK key
 * (mirrors `lib/auth/clerk.ts#getClerkPublishableKey`). RevenueCat public
 * API keys are meant to ship in the client (unlike server secrets,
 * `AGENTS.md` §18), but must still come from env, never be hardcoded here.
 */
export function getRevenueCatApiKey(): string {
  const key =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

  if (!key) {
    throw new Error(
      Platform.OS === "android"
        ? "Add EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY to your .env file (RevenueCat Dashboard -> API keys)."
        : "Add EXPO_PUBLIC_REVENUECAT_IOS_API_KEY to your .env file (RevenueCat Dashboard -> API keys)."
    );
  }
  return key;
}

let configured = false;

/**
 * Routes the SDK's own internal log stream through `console.warn`/`console.log`
 * instead of the default handler `Purchases.configure` installs, which pipes
 * every `LOG_LEVEL.ERROR` line straight to `console.error` — including
 * benign, expected diagnostics like "[Test Store] Purchase failure
 * simulated successfully in Test Store." React Native's LogBox treats any
 * `console.error` as a full red-screen crash report, which is misleading
 * for an expected/handled outcome (`AGENTS.md` §11/§12: cancellations and
 * handled failures are not monitoring errors — the same principle applies
 * to the SDK's own diagnostic logging, not just our error mapping). Real
 * purchase/restore failures are still surfaced to the user through
 * `mapPurchasesError` regardless of this log routing.
 */
function installRevenueCatLogHandler(): void {
  Purchases.setLogHandler((logLevel, message) => {
    switch (logLevel) {
      case LOG_LEVEL.ERROR:
      case LOG_LEVEL.WARN:
        console.warn(`[RevenueCat] ${message}`);
        break;
      case LOG_LEVEL.DEBUG:
        if (__DEV__) console.log(`[RevenueCat] ${message}`);
        break;
      default:
        console.log(`[RevenueCat] ${message}`);
    }
  });
}

/**
 * Configures the RevenueCat SDK exactly once for the process lifetime
 * (`AGENTS.md` §9 "Initialize RevenueCat once"). Called from a root-layout
 * bootstrap component (never from a screen, `AGENTS.md` §20) so it runs
 * before any screen tries to read offerings/customer info. Safe to call
 * from multiple mount/unmount cycles (e.g. Fast Refresh) because of the
 * module-level guard.
 */
export function configureRevenueCatOnce(): void {
  if (configured) return;

  let apiKey: string;
  try {
    apiKey = getRevenueCatApiKey();
  } catch (error) {
    if (__DEV__) {
      console.warn("[purchases]", error instanceof Error ? error.message : error);
    }
    return;
  }

  try {
    // Must run before `configure()`, which only installs its own noisy
    // default log handler when no custom handler has been set yet.
    installRevenueCatLogHandler();
    Purchases.configure({ apiKey });
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    configured = true;
  } catch (error) {
    if (__DEV__) console.warn("[purchases] RevenueCat configuration failed", error);
  }
}

export function isRevenueCatConfigured(): boolean {
  return configured;
}

/** Links the anonymous RevenueCat identity to the authenticated Clerk user (`AGENTS.md` §9). */
export async function loginRevenueCatUser(clerkUserId: string): Promise<void> {
  if (!configured) return;
  await Purchases.logIn(clerkUserId);
}

/** Reverts RevenueCat to a fresh anonymous identity on sign-out. */
export async function logoutRevenueCatUser(): Promise<void> {
  if (!configured) return;
  await Purchases.logOut();
}

/**
 * Maps a `PurchasesPackage` to one of this app's three plan slots. Prefers
 * the dashboard `packageType` classification (`LIFETIME`/`ANNUAL`/`MONTHLY`)
 * and falls back to matching the custom package identifier the integration
 * request names explicitly ("lifetime"/"yearly"/"monthly"), since a custom
 * identifier and its underlying package type are configured independently
 * in the RevenueCat dashboard.
 */
export function resolvePlanId(pkg: PurchasesPackage): SubscriptionPlanId | null {
  switch (pkg.packageType) {
    case PACKAGE_TYPE.LIFETIME:
      return "lifetime";
    case PACKAGE_TYPE.ANNUAL:
      return "yearly";
    case PACKAGE_TYPE.MONTHLY:
      return "monthly";
    default:
      break;
  }

  const identifier = pkg.identifier.toLowerCase();
  if (identifier === "lifetime") return "lifetime";
  if (identifier === "yearly" || identifier === "annual") return "yearly";
  if (identifier === "monthly") return "monthly";
  return null;
}

function formatPeriodLabel(pkg: PurchasesPackage): string | null {
  const unit = pkg.product.subscriptionPeriod;
  if (!unit) return null;
  if (unit === "P1M") return "/month";
  if (unit === "P1Y") return "/year";
  if (unit === "P1W") return "/week";
  return null;
}

/**
 * A free-trial length derived only from the store's real introductory
 * offer — never an invented "3-day trial" (`CLAUDE.md` §10). `null` when
 * the product has no free-trial intro price (a discounted, non-zero intro
 * price is not a free trial and is intentionally not surfaced here).
 */
function freeTrialDaysFromProduct(pkg: PurchasesPackage): number | null {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price !== 0) return null;

  const unitDays: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };
  const days = unitDays[intro.periodUnit];
  if (!days) return null;
  return days * intro.periodNumberOfUnits * intro.cycles;
}

/** Builds the typed package list this app's paywall renders, in a stable plan order. */
export function extractSubscriptionPackages(
  offering: PurchasesOffering,
  introEligibility: Record<string, boolean>
): SubscriptionPackageInfo[] {
  const planOrder: SubscriptionPlanId[] = ["monthly", "yearly", "lifetime"];
  const byPlan = new Map<SubscriptionPlanId, PurchasesPackage>();

  for (const pkg of offering.availablePackages) {
    const planId = resolvePlanId(pkg);
    if (planId && !byPlan.has(planId)) {
      byPlan.set(planId, pkg);
    }
  }

  return planOrder.flatMap((planId) => {
    const pkg = byPlan.get(planId);
    if (!pkg) return [];
    return [
      {
        planId,
        packageIdentifier: pkg.identifier,
        productIdentifier: pkg.product.identifier,
        priceString: pkg.product.priceString,
        priceAmount: pkg.product.price,
        periodLabel: formatPeriodLabel(pkg),
        freeTrialDays: freeTrialDaysFromProduct(pkg),
        introEligible: introEligibility[pkg.product.identifier] ?? true,
      },
    ];
  });
}

export function findPackageForPlan(
  offering: PurchasesOffering,
  planId: SubscriptionPlanId
): PurchasesPackage | null {
  return offering.availablePackages.find((pkg) => resolvePlanId(pkg) === planId) ?? null;
}

/**
 * Classifies real `CustomerInfo` into this app's required lifecycle states
 * (`AGENTS.md` §9: "loading, eligible, subscribed, expired, grace period,
 * billing issue, cancelled-but-active, ..."). RevenueCat has no single
 * "grace period" flag — it is inferred the same way RevenueCat's own docs
 * recommend: `isActive` true with a detected billing issue.
 */
export function deriveEntitlementState(
  customerInfo: CustomerInfo | null
): SubscriptionEntitlementState {
  if (!customerInfo) {
    return {
      lifecycle: "loading",
      isPro: false,
      willRenew: null,
      expirationDate: null,
      managementUrl: null,
      activePlanId: null,
      activeProductIdentifier: null,
    };
  }

  const entitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
  const allEntitlement = customerInfo.entitlements.all[PRO_ENTITLEMENT_ID];

  if (!entitlement) {
    const everHadEntitlement = allEntitlement !== undefined;
    return {
      lifecycle: everHadEntitlement ? "expired" : "free",
      isPro: false,
      willRenew: null,
      expirationDate: allEntitlement?.expirationDate
        ? new Date(allEntitlement.expirationDate)
        : null,
      managementUrl: customerInfo.managementURL,
      activePlanId: null,
      activeProductIdentifier: null,
    };
  }

  const expirationDate = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
  // A lifetime entitlement never expires; monthly/yearly can't be told apart
  // from `PurchasesEntitlementInfo` alone (it carries no subscription period),
  // so the exact plan is resolved precisely in `useSubscription` by matching
  // `entitlement.productIdentifier` against the fetched offering's packages.
  const activePlanId: SubscriptionPlanId | null = expirationDate === null ? "lifetime" : null;

  let lifecycle: SubscriptionLifecycle;
  if (entitlement.billingIssueDetectedAt) {
    lifecycle = "billing_issue";
  } else if (entitlement.periodType === "TRIAL") {
    lifecycle = "trialing";
  } else if (!entitlement.willRenew && expirationDate) {
    lifecycle = "cancelled_active";
  } else {
    lifecycle = "active";
  }

  return {
    lifecycle,
    isPro: true,
    willRenew: entitlement.willRenew,
    expirationDate,
    managementUrl: customerInfo.managementURL,
    activePlanId,
    activeProductIdentifier: entitlement.productIdentifier,
  };
}

/**
 * Maps a raw `PurchasesError` to a typed, user-safe code (`AGENTS.md` §15
 * — never surface `error.message` directly to the user).
 */
export function mapPurchasesError(error: unknown): SubscriptionErrorCode {
  const purchasesError = error as Partial<PurchasesError> | undefined;

  if (purchasesError?.userCancelled) return "purchase_cancelled";

  switch (purchasesError?.code) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return "purchase_cancelled";
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return "purchase_pending";
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
    case PURCHASES_ERROR_CODE.CONFIGURATION_ERROR:
    case PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR:
      return "store_unavailable";
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
      return "product_not_available";
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return "already_subscribed";
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
    case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
      return "network_error";
    default:
      return "unexpected_error";
  }
}

/**
 * Presents RevenueCat's native Customer Center (`react-native-purchases-ui`)
 * for self-serve subscription management/cancellation
 * (`AGENTS.md` §9 "platform-appropriate customer center"). This app's
 * primary paywall is a bespoke screen matching `11-paywall.png`'s approved
 * design rather than RevenueCat's hosted Paywall template — Customer
 * Center has no equivalent design-fidelity requirement (it's Apple/Google's
 * own native management sheet, not a CleanAudio-branded surface), so it is
 * used here as-is per the integration request.
 */
export async function presentCustomerCenter(): Promise<
  { ok: true } | { ok: false; code: SubscriptionErrorCode }
> {
  if (!configured) return { ok: false, code: "sdk_unavailable" };
  try {
    await RevenueCatUI.presentCustomerCenter();
    return { ok: true };
  } catch (error) {
    return { ok: false, code: mapPurchasesError(error) };
  }
}
