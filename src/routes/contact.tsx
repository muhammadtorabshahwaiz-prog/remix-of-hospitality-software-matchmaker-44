import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Mail, MapPin } from "lucide-react";
import { Card } from "@/components/fx";
import { Btn, PageHead, Section, inputCls } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Hospitalityservis" },
    { name: "description", content: "Get in touch with Hospitalityservis — operators, vendors and press." },
    { property: "og:title", content: "Contact Hospitalityservis" },
    { property: "og:description", content: "Operators, vendors and press: reach our team." },
  ] }),
  component: Page,
});

function Page() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHead crumbs={[{ label: "Contact" }]} eyebrow="Open channel" title="Contact us">Operators, vendors and press — we read every message.</PageHead>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {sent ? <div className="flex h-fit items-center gap-2 border border-primary bg-accent p-6 text-primary"><Check className="h-5 w-5" />Message received — we'll reply soon.</div> : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Name" className={inputCls} />
              <input required type="email" placeholder="Email" className={inputCls} />
              <select className={`${inputCls} sm:col-span-2`}><option>I'm an operator</option><option>I'm a vendor</option><option>Press</option><option>Other</option></select>
              <textarea required rows={6} placeholder="Message" className={`${inputCls} sm:col-span-2`} />
              <div><Btn type="submit">Send message</Btn></div>
            </form>
          )}
          <Card className="h-fit p-6 text-sm">
            <div className="flex gap-3"><Mail className="h-5 w-5 text-primary" />hello@hospitalityservis.com</div>
            <div className="mt-4 flex gap-3"><MapPin className="h-5 w-5 text-primary" />United States &amp; Canada</div>
            <p className="mt-4 font-mono text-[10px] uppercase text-muted-foreground">Sample contact details</p>
          </Card>
        </div>
      </Section>
    </>
  );
}
