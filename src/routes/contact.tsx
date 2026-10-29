import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import { Mail, MapPin } from "lucide-react";
import { Card } from "@/components/fx";
import { Btn, PageHead, Section, inputCls } from "@/components/site";
import { FormError, Honeypot, Sent, bool, str, useSubmit } from "@/components/forms";
import { submitLead } from "@/lib/submit";

export const Route = createFileRoute("/contact")({
  head: () => ({ links: [canonical("/contact")], meta: [
    { title: "Contact — Hospitalityservis" },
    { name: "description", content: "Get in touch with Hospitalityservis — operators, vendors and press." },
    { property: "og:title", content: "Contact Hospitalityservis" },
    { property: "og:description", content: "Operators, vendors and press: reach our team." },
  ] }),
  component: Page,
});

function Page() {
  const { busy, sent, err, onSubmit } = useSubmit((fd) => submitLead({
    type: "contact", name: str(fd, "name"), email: str(fd, "email"), interest: str(fd, "audience"), notes: str(fd, "message"),
    consent: bool(fd, "consent"), company_url: str(fd, "company_url"),
  }));
  return (
    <>
      <PageHead crumbs={[{ label: "Contact" }]} eyebrow="Open channel" title="Contact us">Operators, vendors and press — we read every message.</PageHead>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {sent ? <div className="h-fit"><Sent mode={sent}>Message received. We'll reply soon.</Sent></div> : (
            <form onSubmit={onSubmit} noValidate className="relative grid gap-3 sm:grid-cols-2">
              <Honeypot />
              <input name="name" required maxLength={100} placeholder="Name" className={inputCls} />
              <input name="email" required type="email" maxLength={255} placeholder="Email" className={inputCls} />
              <select name="audience" className={`${inputCls} sm:col-span-2`}><option>I'm an operator</option><option>I'm a vendor</option><option>Press</option><option>Other</option></select>
              <textarea name="message" required rows={6} maxLength={2000} placeholder="Message" className={`${inputCls} sm:col-span-2`} />
              <div className="sm:col-span-2"><FormError message={err} /></div>
              <div><Btn type="submit">{busy ? "Sending..." : "Send message"}</Btn></div>
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
