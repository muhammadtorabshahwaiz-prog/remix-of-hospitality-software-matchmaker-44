// SAMPLE DATA — placeholder until real reviews and providers exist.
export type Category = { slug: string; name: string; icon: string; blurb: string; intro: string; group: string };
export type Region = "US" | "Canada" | "UK" | "EU" | "APAC";
export type Provider = {
  slug: string; name: string; category: string; tagline: string; score: number; reviews: number;
  ease: number; value: number; support: number; features: number;
  priceFrom: number; priceLabel: string; countries: Region[]; hardware: boolean;
  companySize: "Small" | "Mid" | "Enterprise"; featureList: string[]; contract: string;
  pros: string[]; cons: string[]; claimed: boolean; year: number;
  priceTier: 1 | 2 | 3; sponsored: boolean; sample: true;
};
export type Review = { id: string; provider: string; author: string; role: string; business: string; rating: number; title: string; body: string; date: string; sample: true };

export const GROUPS = ["Sales & Marketing", "Customer Experience", "Productivity & Collaboration", "HR & Finance", "IT & Security", "Data, AI & Commerce", "Hospitality & Restaurants"] as const;
const C = (group: string, slug: string, name: string, icon: string, blurb: string, intro: string): Category => ({ slug, name, icon, blurb, intro, group });
export const CATEGORIES: Category[] = [
  C("Sales & Marketing", "crm", "CRM Software", "Handshake", "Contacts, pipelines and deal tracking.", "CRM software keeps contacts, deals and conversations in one place. Compare ease of use, automation, integrations and total cost from real users."),
  C("Sales & Marketing", "marketing-automation", "Marketing Automation", "Megaphone", "Email, campaigns and lead nurturing.", "Marketing automation tools run email, lead scoring and multi-step campaigns. Compare deliverability, reporting and pricing as your list grows."),
  C("Sales & Marketing", "sales-engagement", "Sales Engagement", "Target", "Sequences, calling and outreach.", "Sales engagement platforms help teams run outreach sequences and calls. Compare data quality, workflow depth and rep adoption."),
  C("Customer Experience", "customer-support", "Customer Support", "LifeBuoy", "Helpdesks, ticketing and live chat.", "Support software organizes tickets, chat and self-service. Compare response tooling, automation and how well it scales with your team."),
  C("Customer Experience", "ai-phone-answering", "AI Voice Agents", "PhoneCall", "AI that answers and makes phone calls.", "AI voice agents answer calls, book appointments and take orders around the clock. Compare accuracy, integrations, latency and per-minute cost."),
  C("Productivity & Collaboration", "project-management", "Project Management", "ClipboardList", "Tasks, boards and team planning.", "Project management tools plan work and keep teams aligned. Compare views, automation, reporting and per-seat pricing."),
  C("Productivity & Collaboration", "team-collaboration", "Team Collaboration", "MessagesSquare", "Chat, docs and shared workspaces.", "Collaboration software brings chat, documents and knowledge together. Compare search, integrations and admin controls."),
  C("Productivity & Collaboration", "video-conferencing", "Video Conferencing", "Video", "Meetings, webinars and calling.", "Video conferencing tools run meetings and webinars. Compare call quality, security, room features and plans."),
  C("Productivity & Collaboration", "esignature-documents", "eSignature & Documents", "FileSignature", "Sign, send and manage agreements.", "eSignature and document tools speed up contracts. Compare templates, audit trails, integrations and per-envelope costs."),
  C("HR & Finance", "hr-software", "HR & Payroll", "Users", "People records, hiring and payroll.", "HR platforms manage employee records, hiring, onboarding and payroll. Compare compliance support, integrations and implementation effort."),
  C("HR & Finance", "accounting", "Accounting & Invoicing", "Calculator", "Bookkeeping, invoices and reporting.", "Accounting software handles books, invoices and tax reporting. Compare bank feeds, accountant access and add-on costs."),
  C("HR & Finance", "expense-management", "Expense Management", "Receipt", "Cards, receipts and spend control.", "Expense tools control company spend and speed up reimbursements. Compare card terms, approval flows and accounting sync."),
  C("IT & Security", "cybersecurity", "Cybersecurity", "ShieldCheck", "Endpoint and threat protection.", "Cybersecurity platforms protect endpoints and detect threats. Compare detection quality, management overhead and support."),
  C("IT & Security", "identity-access", "Identity & Access", "KeyRound", "SSO, passwords and authentication.", "Identity tools manage logins, single sign-on and passwords. Compare integrations, admin experience and security features."),
  C("IT & Security", "it-service-management", "IT Service Management", "Wrench", "Service desk and IT workflows.", "ITSM software runs help desks, assets and change processes. Compare automation, implementation time and pricing."),
  C("IT & Security", "cloud-devops", "Cloud & DevOps", "Cloud", "Hosting, deployment and code collaboration.", "Cloud and DevOps tools host, build and ship software. Compare reliability, developer experience and cost at scale."),
  C("Data, AI & Commerce", "business-intelligence", "Business Intelligence", "BarChart3", "Dashboards, analytics and reporting.", "BI tools turn data into dashboards and reports. Compare data connectors, ease for non-analysts and licensing."),
  C("Data, AI & Commerce", "ai-assistants", "AI Writing & Assistants", "Sparkles", "AI for writing and content.", "AI writing tools draft and polish content. Compare quality, brand controls, team features and pricing."),
  C("Data, AI & Commerce", "ecommerce-platforms", "E-commerce Platforms", "ShoppingCart", "Online stores and checkout.", "E-commerce platforms power online stores. Compare themes, apps, payment fees and scalability."),
  C("Data, AI & Commerce", "website-builders", "Website Builders", "Globe", "Sites without custom code.", "Website builders let teams launch sites quickly. Compare design flexibility, SEO tools and hosting plans."),
  C("Hospitality & Restaurants", "pos-systems", "Restaurant POS", "MonitorSmartphone", "Terminals, menus and tableside ordering.", "Point-of-sale systems run the front of house: orders, tickets, tips and reporting. Compare fees, hardware and support from real operators."),
  C("Hospitality & Restaurants", "payments", "Payments & Processing", "CreditCard", "Card rates, deposits and chargebacks.", "Processing fees are one of the largest controllable costs for merchants. See effective rates, contract terms and payout speed."),
  C("Hospitality & Restaurants", "funding-loans", "Funding & Loans", "Landmark", "Advances, loans and equipment financing.", "Compare funding options for small businesses. Terms vary by lender and business; always review the full agreement."),
  C("Hospitality & Restaurants", "reservations", "Reservations", "CalendarCheck", "Booking, waitlists and guest profiles.", "Reservation platforms fill tables and capture guest data. Compare cover fees, no-show tools and integrations."),
  C("Hospitality & Restaurants", "online-ordering", "Online Ordering", "ShoppingBag", "Commission-free direct ordering.", "Take orders on your own site and app to cut third-party commissions."),
  C("Hospitality & Restaurants", "marketing-loyalty", "Marketing & Loyalty", "Gift", "SMS, email, loyalty and reviews.", "Bring customers back with loyalty programs, SMS and email that operators say actually work."),
  C("Hospitality & Restaurants", "food-suppliers", "Food Suppliers", "Truck", "Broadline and local distributors.", "Rate distributors on pricing, consistency and delivery reliability."),
  C("Hospitality & Restaurants", "inventory-back-office", "Inventory & Back Office", "Boxes", "Food cost, invoices and recipes.", "Track food cost, process invoices and manage recipes and counts."),
  C("Hospitality & Restaurants", "payroll-scheduling", "Payroll & Scheduling", "CalendarClock", "Shifts, tip pooling and payroll.", "Schedule staff, manage tip pools and run payroll built for hourly teams."),
  C("Hospitality & Restaurants", "delivery-management", "Delivery Management", "Bike", "Dispatch, drivers and marketplaces.", "Manage delivery marketplaces and in-house drivers from one screen."),
];
const HOSPITALITY = new Set(CATEGORIES.filter((c) => c.group === "Hospitality & Restaurants").map((c) => c.slug));

const NAMES: Record<string, string[]> = {
  crm: ["Salesforce", "HubSpot CRM", "Zoho CRM", "Pipedrive"],
  "marketing-automation": ["Marketo Engage", "ActiveCampaign", "Mailchimp"],
  "sales-engagement": ["Outreach", "Salesloft", "Apollo.io"],
  "customer-support": ["Zendesk", "Freshdesk", "Intercom"],
  "ai-phone-answering": ["Slang.ai", "Loman", "Popmenu Answering", "Retell AI", "Vapi", "Synthflow"],
  "project-management": ["Asana", "Monday.com", "ClickUp", "Jira"],
  "team-collaboration": ["Slack", "Microsoft Teams", "Notion"],
  "video-conferencing": ["Zoom", "Webex", "Whereby"],
  "esignature-documents": ["DocuSign", "PandaDoc", "Dropbox Sign"],
  "hr-software": ["Rippling", "BambooHR", "Deel"],
  accounting: ["QuickBooks", "Xero", "FreshBooks"],
  "expense-management": ["Expensify", "Ramp", "Brex"],
  cybersecurity: ["CrowdStrike", "SentinelOne", "Sophos"],
  "identity-access": ["Okta", "1Password", "Auth0"],
  "it-service-management": ["ServiceNow", "Freshservice", "Jira Service Management"],
  "cloud-devops": ["DigitalOcean", "Vercel", "GitHub"],
  "business-intelligence": ["Tableau", "Power BI", "Looker"],
  "ai-assistants": ["Jasper", "Grammarly", "Copy.ai"],
  "ecommerce-platforms": ["Shopify", "BigCommerce", "WooCommerce"],
  "website-builders": ["Wix", "Squarespace", "Webflow"],
  "pos-systems": ["Toast", "Square for Restaurants", "Clover", "SpotOn"],
  payments: ["Stax", "Helcim", "Payment Depot"],
  "funding-loans": ["inKind", "Toast Capital", "Credibly", "Lendio"],
  reservations: ["OpenTable", "Resy", "Tock"],
  "online-ordering": ["ChowNow", "Owner.com", "BentoBox"],
  "marketing-loyalty": ["Thanx", "Paytronix", "Fishbowl"],
  "food-suppliers": ["Sysco", "US Foods", "Chef's Warehouse"],
  "inventory-back-office": ["MarginEdge", "MarketMan", "Restaurant365"],
  "payroll-scheduling": ["7shifts", "Homebase", "Gusto"],
  "delivery-management": ["Olo Dispatch", "Deliverect", "Otter"],
};
const DESCRIPTIONS: Record<string, string> = {
  "Toast": "Restaurant-focused POS with handhelds, online ordering and payments in one platform.",
  "Square for Restaurants": "Flexible POS and payments with free-to-start software and simple hardware bundles.",
  "Clover": "Hardware-led POS with an app marketplace for restaurants and counter-service shops.",
  "SpotOn": "POS, payments and marketing tools aimed at independent and multi-location restaurants.",
  "Stax": "Subscription-style payment processing that passes through wholesale interchange rates.",
  "Helcim": "Interchange-plus processing with published pricing and no long-term contract.",
  "Payment Depot": "Membership-based wholesale processing for higher-volume merchants.",
  "Slang.ai": "AI voice host that answers restaurant calls about hours, menus and reservations.",
  "Loman": "AI phone ordering that takes takeout and delivery orders by voice.",
  "Popmenu Answering": "AI call answering bundled with a restaurant website and marketing platform.",
  "inKind": "Food-and-beverage credit programs that front capital and are repaid in venue credit.",
  "Toast Capital": "Financing offered to Toast merchants, repaid as a share of card sales.",
  "Credibly": "Small-business loans and advances with a range of term and repayment options.",
  "Lendio": "Loan marketplace that matches businesses with multiple lenders.",
  "OpenTable": "Large consumer reservation network with guest discovery and table management.",
  "Resy": "Reservation and waitlist platform popular with chef-driven and higher-end venues.",
  "Tock": "Reservation system with prepaid tickets, events and tasting-menu support.",
  "ChowNow": "Commission-free online ordering with branded ordering pages and apps.",
  "Owner.com": "All-in-one website, online ordering and marketing built for independent restaurants.",
  "BentoBox": "Restaurant website and marketing platform with ordering and reservation integrations.",
  "Thanx": "Loyalty and guest-engagement platform that connects to POS purchase data.",
  "Paytronix": "Enterprise loyalty, ordering and guest data platform for larger restaurant brands.",
  "Fishbowl": "Email and SMS marketing and loyalty built for restaurant groups.",
  "Sysco": "Broadline food distributor serving restaurants, hotels and institutions.",
  "US Foods": "Broadline foodservice distributor with ordering tools and local delivery routes.",
  "Chef's Warehouse": "Specialty ingredient distributor focused on chef-driven and fine-dining kitchens.",
  "MarginEdge": "Invoice capture, food-cost tracking and bill pay for restaurant back offices.",
  "MarketMan": "Inventory, purchasing and recipe-costing software for kitchens and groups.",
  "Restaurant365": "Accounting, inventory and scheduling suite for multi-unit operators.",
  "7shifts": "Restaurant scheduling, team communication and labor-cost tools.",
  "Homebase": "Scheduling, time clock and payroll for small hourly teams.",
  "Gusto": "Payroll, benefits and HR platform that works across industries, including restaurants.",
  "Olo Dispatch": "Delivery dispatch that routes orders to third-party courier networks.",
  "Deliverect": "Order-aggregation layer that pulls delivery marketplace orders into the POS.",
  "Otter": "Delivery marketplace aggregation and virtual brand tools for restaurants.",
  "Salesforce": "Enterprise CRM platform with sales, service and marketing clouds and a large app ecosystem.",
  "HubSpot CRM": "CRM with free core tools and paid hubs for marketing, sales and service.",
  "Zoho CRM": "Affordable CRM with automation and a wider Zoho business app suite.",
  "Pipedrive": "Pipeline-focused CRM built for small sales teams.",
  "Marketo Engage": "Marketing automation for B2B lead nurturing and account-based campaigns.",
  "ActiveCampaign": "Email marketing and automation with a built-in CRM for growing businesses.",
  "Mailchimp": "Email marketing and audience tools popular with small businesses.",
  "Outreach": "Sales engagement platform for sequences, calling and pipeline workflows.",
  "Salesloft": "Sales engagement and revenue workflow platform for B2B teams.",
  "Apollo.io": "Prospecting database with outreach sequences in one tool.",
  "Zendesk": "Customer service platform with ticketing, messaging and a help center.",
  "Freshdesk": "Helpdesk with ticketing and automation for small and mid-size support teams.",
  "Intercom": "Customer messaging and support platform with an AI agent and shared inbox.",
  "Retell AI": "Platform for building AI voice agents that handle inbound and outbound calls.",
  "Vapi": "Developer platform for building and deploying voice AI agents.",
  "Synthflow": "No-code builder for AI phone agents.",
  "Asana": "Work management for planning projects, tasks and team workloads.",
  "Monday.com": "Customizable work management platform with visual boards and automations.",
  "ClickUp": "All-in-one project management with tasks, docs and goals.",
  "Jira": "Issue and project tracking widely used by software and engineering teams.",
  "Slack": "Team messaging with channels, huddles and a large app directory.",
  "Microsoft Teams": "Chat, meetings and collaboration bundled with Microsoft 365.",
  "Notion": "Flexible workspace combining docs, wikis and lightweight project tracking.",
  "Zoom": "Video meetings, webinars and phone for distributed teams.",
  "Webex": "Enterprise meetings, calling and collaboration from Cisco.",
  "Whereby": "Simple browser-based video meetings with embeddable rooms.",
  "DocuSign": "Electronic signature and agreement management platform.",
  "PandaDoc": "Proposal, quote and contract documents with eSignature.",
  "Dropbox Sign": "Straightforward eSignature with templates and API options.",
  "Rippling": "HR, payroll, IT and device management on one employee record.",
  "BambooHR": "HR software for small and mid-size companies covering records, hiring and onboarding.",
  "Deel": "Global hiring, contractor payments and compliance platform.",
  "QuickBooks": "Small-business accounting, invoicing and payroll add-ons from Intuit.",
  "Xero": "Cloud accounting with bank feeds and a broad app marketplace.",
  "FreshBooks": "Invoicing and accounting aimed at freelancers and service businesses.",
  "Expensify": "Expense reports, receipt scanning and reimbursements.",
  "Ramp": "Corporate cards with spend management and accounting automation.",
  "Brex": "Corporate cards, expense management and banking for startups and enterprises.",
  "CrowdStrike": "Cloud-delivered endpoint protection and threat detection.",
  "SentinelOne": "AI-driven endpoint security with automated response.",
  "Sophos": "Endpoint, firewall and managed detection services for small and mid-size organizations.",
  "Okta": "Workforce identity, single sign-on and multi-factor authentication.",
  "1Password": "Password and secrets manager for individuals, teams and businesses.",
  "Auth0": "Authentication and authorization service for developers building apps.",
  "ServiceNow": "Enterprise IT service management and workflow automation platform.",
  "Freshservice": "IT service desk and asset management for mid-size teams.",
  "Jira Service Management": "IT and service desk built on the Jira platform.",
  "DigitalOcean": "Simple cloud hosting for developers and small teams.",
  "Vercel": "Hosting and deployment platform for front-end and web apps.",
  "GitHub": "Code hosting, collaboration and CI/CD for software teams.",
  "Tableau": "Visual analytics and dashboards for exploring business data.",
  "Power BI": "Microsoft's business intelligence tool for reports and dashboards.",
  "Looker": "Governed data modeling and BI from Google Cloud.",
  "Jasper": "AI writing assistant for marketing copy and brand content.",
  "Grammarly": "Writing assistant for grammar, tone and clarity across apps.",
  "Copy.ai": "AI tool for generating and automating go-to-market content.",
  "Shopify": "Hosted e-commerce platform with themes, apps and built-in payments.",
  "BigCommerce": "E-commerce platform with built-in B2B and multi-channel features.",
  "WooCommerce": "Open-source e-commerce plugin for WordPress sites.",
  "Wix": "Drag-and-drop website builder with templates and hosting.",
  "Squarespace": "Design-led website builder with built-in commerce and scheduling.",
  "Webflow": "Visual web design platform that outputs clean code and a CMS.",
};
export const FEATURES = ["Free trial", "Mobile app", "API", "SSO / SAML", "Integrations", "24/7 support", "Analytics", "Multi-user"];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const r = (seed: number, min: number, max: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return min + (x - Math.floor(x)) * (max - min); };

export const PROVIDERS: Provider[] = Object.entries(NAMES).flatMap(([cat, names], ci) =>
  names.map((name, i) => {
    const s = ci * 10 + i + 1; const sc = (n: number) => Math.round(r(s + n, 3.6, 4.9) * 10) / 10;
    const price = Math.round(r(s, 0, 300) / 10) * 10; const tier = (price < 100 ? 1 : price < 200 ? 2 : 3) as 1 | 2 | 3;
    return {
      slug: slugify(name), name, category: cat, tagline: DESCRIPTIONS[name] ?? `${name} for restaurants.`,
      score: sc(0), reviews: Math.round(r(s + 1, 40, 2400)), ease: sc(2), value: sc(3), support: sc(4), features: sc(5),
      priceFrom: price, priceTier: tier, priceLabel: `${"$".repeat(tier)} · Request a quote`,
      countries: (HOSPITALITY.has(cat) ? (i % 3 === 2 ? ["US"] : ["US", "Canada"]) : i % 3 === 0 ? ["US", "Canada", "UK", "EU", "APAC"] : i % 3 === 1 ? ["US", "Canada", "UK", "EU"] : ["US"]) as Region[], hardware: cat === "pos-systems" || (HOSPITALITY.has(cat) && i % 2 === 0),
      companySize: (["Small", "Mid", "Enterprise"] as const)[i % 3]!,
      featureList: FEATURES.filter((_, k) => (k + i + ci) % 3 !== 0),
      contract: i % 2 ? "Month-to-month" : "12-month term",
      pros: ["Fast setup", "Users like the reporting", "Responsive support"].slice(0, 2 + (i % 2)),
      cons: ["Add-ons increase total cost", "Learning curve for new users"].slice(0, 1 + (i % 2)),
      claimed: i % 2 === 0, year: 2026 - (i % 4), sponsored: false, sample: true as const,
    };
  }),
);

const AUTHORS = [
  ["Maria G.", "Owner", "Taqueria, Austin TX"], ["Dev P.", "Head of Operations", "SaaS startup, Toronto ON"], ["Sam K.", "Marketing Manager", "Agency, Portland OR"],
  ["Lena R.", "Founder", "E-commerce brand, Chicago IL"], ["Omar H.", "IT Director", "Logistics firm, Dallas TX"], ["Priya N.", "Sales Lead", "B2B software, London UK"],
  ["Tom B.", "CTO", "Fintech, Denver CO"], ["Aisha W.", "HR Manager", "Healthcare group, Atlanta GA"], ["Luc M.", "Operations Lead", "Retailer, Montreal QC"],
  ["Chris D.", "Customer Success Lead", "Software company, Brooklyn NY"], ["Hana T.", "Finance Controller", "Services firm, Seattle WA"], ["Rafael C.", "Owner", "Food truck, Miami FL"],
] as const;
const BODIES = [
  ["Switched and saved money", "Setup took about a week. Our costs dropped and support picks up when we call."],
  ["Solid, but watch the add-ons", "The core product is great. Every extra module adds up, so price it out fully."],
  ["Saved our team hours every week", "We stopped doing this by hand. People can focus on customers instead of busywork."],
  ["Good fit for a small team", "Simple enough that new hires learn it in a day."],
  ["Reporting is the real win", "Numbers that used to take an hour in spreadsheets are now one click."],
  ["Onboarding was rough", "Migration took longer than promised, but the team stayed with us until it was clean."],
  ["Does the job, nothing flashy", "Reliable day to day. I would like better export options for my accountant."],
  ["Support makes the difference", "Real people, fast answers, and they know our industry. That is why we stayed."],
  ["Great for growing teams", "Changes roll out to everyone at once, which saves managers hours."],
  ["Fair price once you negotiate", "The first quote was high. Ask about annual terms and what is bundled."],
];
export const REVIEWS: Review[] = PROVIDERS.flatMap((p, pi) =>
  [0, 1].map((k) => {
    const a = AUTHORS[(pi * 5 + k * 5) % AUTHORS.length]!, b = BODIES[(pi * 3 + k * 3) % BODIES.length]!;
    return { id: `${p.slug}-${k}`, provider: p.slug, author: a[0], role: a[1], business: a[2], rating: Math.max(3, Math.min(5, Math.round(p.score - k * 0.6))), title: b[0] as string, body: b[1] as string, date: `2026-${String(((pi + k) % 9) + 1).padStart(2, "0")}-${String(((pi * 3) % 27) + 1).padStart(2, "0")}`, sample: true as const };
  }),
);

export const BEST = [
  { slug: "best-crm-for-small-business", title: "Best CRM Software for Small Business", category: "crm", lead: "Ranked on ease of use, automation, integrations and total cost for small teams." },
  { slug: "best-project-management-tools", title: "Best Project Management Software", category: "project-management", lead: "Ranked on views, automation, reporting and value per seat." },
  { slug: "best-customer-support-software", title: "Best Customer Support Software", category: "customer-support", lead: "Ranked on ticketing, automation, self-service and scalability." },
  { slug: "best-accounting-software", title: "Best Accounting Software", category: "accounting", lead: "Ranked on bank feeds, invoicing, reporting and accountant access." },
  { slug: "best-cybersecurity-software", title: "Best Cybersecurity Software", category: "cybersecurity", lead: "Ranked on detection quality, management overhead and support." },
  { slug: "best-ai-phone-answering", title: "Best AI Voice Agents", category: "ai-phone-answering", lead: "Ranked on call capture, accuracy and integrations." },
  { slug: "best-pos-for-food-trucks", title: "Best POS for Food Trucks", category: "pos-systems", lead: "Mobile hardware, offline mode and fast lines matter most for trucks." },
  { slug: "best-restaurant-payment-processing", title: "Best Payment Processing", category: "payments", lead: "Ranked on effective rate, contract terms and payout speed." },
  { slug: "best-restaurant-funding", title: "Best Business Funding Options", category: "funding-loans", lead: "Ranked on transparency, speed and customer experience." },
  { slug: "best-loyalty-programs", title: "Best Loyalty Programs", category: "marketing-loyalty", lead: "Ranked on repeat visit lift and ease for customers." },
];
export const categoriesInGroup = (g: string) => CATEGORIES.filter((c) => c.group === g);

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const getProvider = (slug: string) => PROVIDERS.find((p) => p.slug === slug);
export const providersIn = (cat: string) => PROVIDERS.filter((p) => p.category === cat);
export const reviewsFor = (slug: string) => REVIEWS.filter((r) => r.provider === slug);
