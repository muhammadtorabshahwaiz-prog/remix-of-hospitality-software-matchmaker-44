import { useEffect } from "react";

export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} — Hospitalityservis`;
    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}

export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const current = JSON.parse(sessionStorage.getItem("hs-attribution") || "{}") as Record<string, string>;
    const mapping: Record<string, string> = { utm_source: "utmSource", utm_medium: "utmMedium", utm_campaign: "utmCampaign", ref: "source", partner: "source" };
    Object.entries(mapping).forEach(([param, key]) => {
      const value = params.get(param);
      if (value) current[key] = value.slice(0, 120);
    });
    sessionStorage.setItem("hs-attribution", JSON.stringify(current));
  } catch { /* Attribution is optional. */ }
}

export function getAttribution() {
  try { return JSON.parse(sessionStorage.getItem("hs-attribution") || "{}") as Record<string, string>; }
  catch { return {}; }
}
