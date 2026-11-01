import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/marketplace";
import { SimpleLeadForm } from "@/components/simple-lead-form";
import { usePageTitle } from "@/lib/seo";

export default function Contact() {
  usePageTitle("Contact", "Contact Hospitalityservis about the software directory, reviews, vendor profiles, or partnerships.");
  return <><PageHeader eyebrow="Contact" title={<>Start a useful<br />conversation.</>} breadcrumbs={[{ label: "Contact" }]}><p>Ask about the directory, review moderation, a vendor profile, or a potential partnership. Your message is saved for follow-up.</p></PageHeader><div className="site-container grid gap-12 py-16 lg:grid-cols-[1fr_320px] lg:py-24"><SimpleLeadForm type="contact" consentLabel="I agree that Hospitalityservis may use these details to respond to my message." submitLabel="Send message" /><aside className="space-y-8 border-t border-border pt-6"><div><Mail className="h-5 w-5 text-primary" /><h2 className="mt-3 font-display text-xl font-bold">Buyers</h2><p className="mt-2 text-muted-foreground">Ask about a category, comparison, review, or introduction.</p></div><div><MessageSquare className="h-5 w-5 text-primary" /><h2 className="mt-3 font-display text-xl font-bold">Vendors</h2><p className="mt-2 text-muted-foreground">Ask about claiming a profile, review responses, or labeled sponsored placements.</p></div><div><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="mt-3 font-display text-xl font-bold">Privacy</h2><p className="mt-2 text-muted-foreground">We use your details only to respond and operate the request. No mailing list is added by this form.</p></div></aside></div></>;
}
