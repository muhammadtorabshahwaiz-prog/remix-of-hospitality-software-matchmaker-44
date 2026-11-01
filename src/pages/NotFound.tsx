import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/lib/seo";

export default function NotFound() {
  usePageTitle("Page not found");
  return <div className="site-container flex min-h-[70dvh] items-center py-20"><div><p className="mono-label text-primary">404 · Outside the index</p><h1 className="display-xl mt-6">Not found.</h1><p className="mt-6 max-w-lg text-xl text-muted-foreground">This page may have moved, or the product or category does not exist in the current catalog.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/" className="btn-primary"><ArrowLeft className="h-4 w-4" />Back home</Link><Link to="/categories" className="btn-secondary">Browse categories</Link></div></div></div>;
}
