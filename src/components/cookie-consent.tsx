import { useEffect, useState } from "react";
import { Link } from "react-router";

const KEY = "hs-cookie-v1";
const read = () => { try { return localStorage.getItem(KEY); } catch { return "x"; } };

/** Small, unobtrusive notice. Only essential storage (theme, comparison list) is used unless the visitor opts in. */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOpen(read() === null), 1200); return () => clearTimeout(t); }, []);
  if (!open) return null;
  const choose = (v: "all" | "essential") => { try { localStorage.setItem(KEY, v); } catch { /* ignore */ } setOpen(false); };
  return (
    <div role="dialog" aria-label="Cookie preferences" className="slab fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl p-5 sm:left-auto sm:right-6" data-no-tilt>
      <p className="text-sm text-muted-foreground">We use essential storage to remember your theme and comparison choices. With your permission we also use anonymous analytics to improve the site. See our <Link to="/privacy" className="link-underline text-primary">privacy policy</Link>.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("all")} className="btn-primary !min-h-10 !px-5">Accept all</button>
        <button type="button" onClick={() => choose("essential")} className="btn-secondary !min-h-10 !px-5">Essential only</button>
      </div>
    </div>
  );
}
