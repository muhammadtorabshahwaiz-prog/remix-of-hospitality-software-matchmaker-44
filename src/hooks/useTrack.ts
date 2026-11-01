import { useCallback } from "react";
import { getAttribution } from "@/lib/seo";
import { trpc } from "@/providers/trpc";

type Kind = "partner_view" | "outbound_click" | "compare_start" | "search" | "cta_click";
const consented = () => { try { return localStorage.getItem("hs-cookie-v1") === "all"; } catch { return false; } };

/** Anonymous, cookie-free event counter. It only fires after the visitor chose "Accept all" in the cookie notice. */
export function useTrack() {
  const mutation = trpc.analytics.track.useMutation();
  const { mutate } = mutation;
  return useCallback((kind: Kind, slug?: string) => {
    if (!consented()) return;
    const attribution = getAttribution() as Record<string, string | undefined>;
    mutate({ kind, path: location.pathname.slice(0, 300), slug, source: attribution.source, utmSource: attribution.utmSource, utmMedium: attribution.utmMedium, utmCampaign: attribution.utmCampaign });
  }, [mutate]);
}
