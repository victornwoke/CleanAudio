import { useCallback, useEffect, useRef, useState } from "react";
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesOffering,
} from "react-native-purchases";

import {
  deriveEntitlementState,
  extractSubscriptionPackages,
  findPackageForPlan,
  isRevenueCatConfigured,
  mapPurchasesError,
  resolvePlanId,
} from "@/lib/purchases/revenuecat";
import type {
  SubscriptionEntitlementState,
  SubscriptionErrorCode,
  SubscriptionPackageInfo,
  SubscriptionPlanId,
} from "@/types/subscription";

export type PurchaseOutcome = { ok: true } | { ok: false; code: SubscriptionErrorCode };
export type RestoreOutcome = { ok: true; restoredPro: boolean } | { ok: false; code: SubscriptionErrorCode };

export interface UseSubscriptionResult extends SubscriptionEntitlementState {
  packages: SubscriptionPackageInfo[];
  offeringsLoading: boolean;
  offeringsError: SubscriptionErrorCode | null;
  purchaseInProgress: boolean;
  restoreInProgress: boolean;
  purchase: (planId: SubscriptionPlanId) => Promise<PurchaseOutcome>;
  restore: () => Promise<RestoreOutcome>;
  refreshOfferings: () => Promise<void>;
}

const UNAVAILABLE_STATE: SubscriptionEntitlementState = {
  lifecycle: "unavailable",
  isPro: false,
  willRenew: null,
  expirationDate: null,
  managementUrl: null,
  activePlanId: null,
  activeProductIdentifier: null,
};

async function fetchIntroEligibility(offering: PurchasesOffering): Promise<Record<string, boolean>> {
  const productIdentifiers = offering.availablePackages.map((pkg) => pkg.product.identifier);
  if (productIdentifiers.length === 0) return {};

  try {
    const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIdentifiers);
    return Object.fromEntries(
      Object.entries(result).map(([productId, eligibility]) => [
        productId,
        eligibility.status !== INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE &&
          eligibility.status !== INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS,
      ])
    );
  } catch {
    // Best-effort only — never block rendering plan cards over eligibility lookup failure.
    return {};
  }
}

/**
 * The real RevenueCat-backed subscription hook (`AGENTS.md` §9). Fetches
 * offerings/customer info once RevenueCat is configured (`_layout.tsx`'s
 * bootstrap), keeps entitlement state live via
 * `addCustomerInfoUpdateListener`, and exposes typed purchase/restore
 * actions. Renders `lifecycle: "unavailable"` rather than fabricating a
 * free or Pro state when the SDK isn't configured (missing API key,
 * `CLAUDE.md` §10).
 */
export function useSubscription(): UseSubscriptionResult {
  const configured = isRevenueCatConfigured();
  const [entitlement, setEntitlement] = useState<SubscriptionEntitlementState>(
    configured ? deriveEntitlementState(null) : UNAVAILABLE_STATE
  );
  const [packages, setPackages] = useState<SubscriptionPackageInfo[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(configured);
  const [offeringsError, setOfferingsError] = useState<SubscriptionErrorCode | null>(null);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const currentOfferingRef = useRef<PurchasesOffering | null>(null);

  const applyCustomerInfo = useCallback((customerInfo: CustomerInfo) => {
    const state = deriveEntitlementState(customerInfo);
    const offering = currentOfferingRef.current;
    if (state.activePlanId === null && offering && state.activeProductIdentifier) {
      const matched = offering.availablePackages.find(
        (pkg) => pkg.product.identifier === state.activeProductIdentifier
      );
      if (matched) {
        state.activePlanId = resolvePlanId(matched) ?? state.activePlanId;
      }
    }
    setEntitlement(state);
  }, []);

  const loadOfferings = useCallback(async () => {
    if (!configured) return;
    setOfferingsLoading(true);
    setOfferingsError(null);
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      currentOfferingRef.current = current;
      if (!current) {
        setPackages([]);
        setOfferingsError("offerings_unavailable");
        return;
      }
      const introEligibility = await fetchIntroEligibility(current);
      setPackages(extractSubscriptionPackages(current, introEligibility));
    } catch (error) {
      setPackages([]);
      setOfferingsError(mapPurchasesError(error));
    } finally {
      setOfferingsLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) return;

    let mounted = true;

    Purchases.getCustomerInfo()
      .then((info) => {
        if (mounted) applyCustomerInfo(info);
      })
      .catch(() => {
        if (mounted) setEntitlement(UNAVAILABLE_STATE);
      });

    void loadOfferings();

    const listener: CustomerInfoUpdateListener = (info) => {
      if (mounted) applyCustomerInfo(info);
    };
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [configured, applyCustomerInfo, loadOfferings]);

  const purchase = useCallback(
    async (planId: SubscriptionPlanId): Promise<PurchaseOutcome> => {
      if (!configured) return { ok: false, code: "sdk_unavailable" };
      const offering = currentOfferingRef.current;
      const pkg = offering ? findPackageForPlan(offering, planId) : null;
      if (!pkg) return { ok: false, code: "product_not_available" };

      setPurchaseInProgress(true);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        applyCustomerInfo(customerInfo);
        return { ok: true };
      } catch (error) {
        return { ok: false, code: mapPurchasesError(error) };
      } finally {
        setPurchaseInProgress(false);
      }
    },
    [configured, applyCustomerInfo]
  );

  const restore = useCallback(async (): Promise<RestoreOutcome> => {
    if (!configured) return { ok: false, code: "sdk_unavailable" };

    setRestoreInProgress(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      applyCustomerInfo(customerInfo);
      return { ok: true, restoredPro: deriveEntitlementState(customerInfo).isPro };
    } catch (error) {
      return { ok: false, code: mapPurchasesError(error) };
    } finally {
      setRestoreInProgress(false);
    }
  }, [configured, applyCustomerInfo]);

  return {
    ...entitlement,
    packages,
    offeringsLoading,
    offeringsError,
    purchaseInProgress,
    restoreInProgress,
    purchase,
    restore,
    refreshOfferings: loadOfferings,
  };
}
