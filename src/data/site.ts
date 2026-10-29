// SAMPLE DATA — placeholder until real reviews and providers exist.
export type Category = { slug: string; name: string; icon: string; blurb: string; intro: string };
export type Provider = {
  slug: string; name: string; category: string; tagline: string; score: number; reviews: number;
  ease: number; value: number; support: number; features: number;
  priceFrom: number; priceLabel: string; countries: ("US" | "Canada")[]; hardware: boolean;
  companySize: "Small" | "Mid" | "Enterprise"; featureList: string[]; contract: string;
  pros: string[]; cons: string[]; claimed: boolean; year: number;
};
export type Review = { id: string; provider: string; author: string; role: string; business: string; rating: number; title: string; body: string; date: string };

export const CATEGORIES: Category[] = [
  { slug: "pos-systems", name: "POS Systems", icon: "MonitorSmartphone", blurb: "Terminals, menus and tableside ordering.", intro: "Point-of-sale systems run the front of house: orders, tickets, tips and reporting. Compare fees, hardware and support from real operators." },
  { slug: "payments", name: "Payments and Processing", icon: "CreditCard", blurb: "Card rates, deposits and chargebacks.", intro: "Processing fees are one of the largest controllable costs. See effective rates, contract terms and payout speed." },
  { slug: "ai-phone-answering", name: "AI Phone Answering", icon: "PhoneCall", blurb: "Never miss an order or reservation call.", intro: "AI phone agents answer every call, take orders and catering inquiries and book tables during rush hour." },
  { slug: "funding-loans", name: "Restaurant Funding and Loans", icon: "Landmark", blurb: "Advances, loans and equipment financing.", intro: "Compare funding options for restaurants. Terms vary by lender and business; always review the full agreement." },
  { slug: "reservations", name: "Reservations", icon: "CalendarCheck", blurb: "Booking, waitlists and guest profiles.", intro: "Reservation platforms fill tables and capture guest data. Compare cover fees, no-show tools and integrations." },
  { slug: "online-ordering", name: "Online Ordering", icon: "ShoppingBag", blurb: "Commission-free direct ordering.", intro: "Take orders on your own site and app to cut third-party commissions." },
  { slug: "marketing-loyalty", name: "Marketing and Loyalty", icon: "Megaphone", blurb: "SMS, email, loyalty and reviews.", intro: "Bring guests back with loyalty programs, SMS and email that operators say actually work." },
  { slug: "food-suppliers", name: "Food Suppliers", icon: "Truck", blurb: "Broadline and local distributors.", intro: "Rate distributors on pricing, consistency and delivery reliability." },
  { slug: "inventory-back-office", name: "Inventory and Back Office", icon: "Boxes", blurb: "Food cost, invoices and recipes.", intro: "Track food cost, process invoices and manage recipes and counts." },
  { slug: "payroll-scheduling", name: "Payroll and Scheduling", icon: "Users", blurb: "Shifts, tip pooling and payroll.", intro: "Schedule staff, manage tip pools and run payroll built for hospitality." },
  { slug: "delivery-management", name: "Delivery Management", icon: "Bike", blurb: "Dispatch, drivers and marketplaces.", intro: "Manage delivery marketplaces and in-house drivers from one screen." },
];

const NAMES: Record<string, string[]> = {
  "pos-systems": ["Toast", "Square for Restaurants", "Clover", "SpotOn"],
  payments: ["Stax", "Helcim", "Payment Depot"],
  "ai-phone-answering": ["Slang.ai", "Loman", "Popmenu Answering"],
  "funding-loans": ["inKind", "Toast Capital", "Credibly", "Lendio"],
  reservations: ["OpenTable", "Resy", "Tock"],
  "online-ordering": ["ChowNow", "Owner.com", "BentoBox"],
  "marketing-loyalty": ["Thanx", "Paytronix", "Fishbowl"],
  "food-suppliers": ["Sysco", "US Foods", "Chef's Warehouse"],
  "inventory-back-office": ["MarginEdge", "MarketMan", "Restaurant365"],
  "payroll-scheduling": ["7shifts", "Homebase", "Gusto"],
  "delivery-management": ["Olo Dispatch", "Deliverect", "Otter"],
};
const FEATURES = ["Online ordering", "Tableside", "Offline mode", "Loyalty", "Inventory", "API", "Multi-location", "24/7 support"];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const r = (seed: number, min: number, max: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return min + (x - Math.floor(x)) * (max - min); };

export const PROVIDERS: Provider[] = Object.entries(NAMES).flatMap(([cat, names], ci) =>
  names.map((name, i) => {
    const s = ci * 10 + i + 1; const sc = (n: number) => Math.round(r(s + n, 3.6, 4.9) * 10) / 10;
    const price = Math.round(r(s, 0, 300) / 10) * 10;
    return {
      slug: slugify(name), name, category: cat, tagline: `${name} for restaurants, food trucks and multi-location groups.`,
      score: sc(0), reviews: Math.round(r(s + 1, 40, 2400)), ease: sc(2), value: sc(3), support: sc(4), features: sc(5),
      priceFrom: price, priceLabel: price === 0 ? "Free plan available" : `From $${price}/mo`,
      countries: i % 3 === 2 ? ["US"] : ["US", "Canada"], hardware: cat === "pos-systems" || i % 2 === 0,
      companySize: (["Small", "Mid", "Enterprise"] as const)[i % 3]!,
      featureList: FEATURES.filter((_, k) => (k + i + ci) % 3 !== 0),
      contract: i % 2 ? "Month-to-month" : "12-month term",
      pros: ["Fast setup", "Operators like the reporting", "Responsive local support"].slice(0, 2 + (i % 2)),
      cons: ["Add-ons increase total cost", "Learning curve for staff"].slice(0, 1 + (i % 2)),
      claimed: i % 2 === 0, year: 2026 - (i % 4),
    };
  }),
);

const AUTHORS = [["Maria G.", "Owner", "Taqueria, Austin TX"], ["Dev P.", "GM", "Bistro, Toronto ON"], ["Sam K.", "Operator", "Food truck, Portland OR"], ["Lena R.", "Owner", "Cafe, Chicago IL"], ["Omar H.", "Director of Ops", "3-unit group, Dallas TX"]] as const;
const BODIES = [
  ["Switched and saved on fees", "Setup took a week. Our effective rate dropped and support picks up the phone."],
  ["Solid, but watch the add-ons", "Core product is great. Every extra module adds up, so price it out fully."],
  ["Rush hour lifesaver", "We stopped missing calls on Friday nights. Staff can focus on guests."],
  ["Good fit for a small team", "Simple enough that new hires learn it in a shift."],
];
export const REVIEWS: Review[] = PROVIDERS.flatMap((p, pi) =>
  [0, 1].map((k) => {
    const a = AUTHORS[(pi + k) % AUTHORS.length]!, b = BODIES[(pi + k) % BODIES.length]!;
    return { id: `${p.slug}-${k}`, provider: p.slug, author: a[0], role: a[1], business: a[2], rating: Math.max(3, Math.min(5, Math.round(p.score - k * 0.6))), title: b[0] as string, body: b[1] as string, date: `2026-${String(((pi + k) % 9) + 1).padStart(2, "0")}-${String(((pi * 3) % 27) + 1).padStart(2, "0")}` };
  }),
);

export const BEST = [
  { slug: "best-pos-for-food-trucks", title: "Best POS for Food Trucks", category: "pos-systems", lead: "Mobile hardware, offline mode and fast lines matter most for trucks." },
  { slug: "best-ai-phone-answering", title: "Best AI Phone Answering for Restaurants", category: "ai-phone-answering", lead: "Ranked on call capture, order accuracy and POS integration." },
  { slug: "best-restaurant-payment-processing", title: "Best Payment Processing for Restaurants", category: "payments", lead: "Ranked on effective rate, contract terms and payout speed." },
  { slug: "best-restaurant-funding", title: "Best Restaurant Funding Options", category: "funding-loans", lead: "Ranked on transparency, speed and operator experience." },
  { slug: "best-loyalty-programs", title: "Best Loyalty Programs for Restaurants", category: "marketing-loyalty", lead: "Ranked on repeat visit lift and ease for guests." },
];

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const getProvider = (slug: string) => PROVIDERS.find((p) => p.slug === slug);
export const providersIn = (cat: string) => PROVIDERS.filter((p) => p.category === cat);
export const reviewsFor = (slug: string) => REVIEWS.filter((r) => r.provider === slug);
