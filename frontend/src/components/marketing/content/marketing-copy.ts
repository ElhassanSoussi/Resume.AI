/** Shared marketing copy — single source for landing, pricing, examples. */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const LANDING_FAQ: FaqItem[] = [
  {
    id: "export",
    question: "How does PDF export billing work?",
    answer:
      "You can draft and preview for free. When you’re ready to download a recruiter-ready PDF, you unlock a one-time export for that resume. Team plans bundle seats and invoicing separately.",
  },
  {
    id: "ai",
    question: "Will AI rewrite my experience without my voice?",
    answer:
      "ResumeForge suggests tighter phrasing and structure — you approve every change. Nothing ships to your final resume until you accept it.",
  },
  {
    id: "templates",
    question: "Can I switch templates after I write content?",
    answer:
      "Yes. Your sections stay intact; the layout engine reflows into Minimal Pro, Modern Sidebar, or Executive instantly so you can A/B test presentation.",
  },
  {
    id: "data",
    question: "Who owns my data?",
    answer:
      "You do. We’re built to sync with your account on our API — export or delete your resumes when you want, subject to your workspace policy.",
  },
  {
    id: "ats",
    question: "Are exports ATS-friendly?",
    answer:
      "PDFs use clean hierarchy and readable type — optimized for both human reviewers and parsing. For strict ATS portals, use the structured text sections we generate.",
  },
];

export const PRICING_FAQ_EXTRA: FaqItem[] = [
  {
    id: "refund",
    question: "Do you offer refunds on export credits?",
    answer:
      "If a technical issue prevents a successful export, contact support within 7 days and we’ll make it right — including re-running the pipeline or crediting your account.",
  },
  {
    id: "teams",
    question: "How does Teams billing work?",
    answer:
      "We invoice annually with a minimum seat count. You’ll get a shared workspace, consolidated billing, and optional SAML — talk to us for a tailored quote.",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Import or start fresh",
    description:
      "Paste an old resume, upload notes, or begin from a guided blank — sections stay modular.",
  },
  {
    step: "02",
    title: "Refine with AI assist",
    description:
      "Tighten summaries, sharpen bullets, and align tone to the role — always editable, never final until you say so.",
  },
  {
    step: "03",
    title: "Pick a premium layout",
    description:
      "Swap between three studio templates with one click. Preview pixel-perfect before you pay to export.",
  },
  {
    step: "04",
    title: "Export PDF with confidence",
    description:
      "Unlock a one-time high-fidelity PDF when you’re ready — crisp type, print-safe margins, shareable link metadata.",
  },
] as const;

export const TEMPLATE_SHOWCASE = [
  {
    id: "minimal-pro",
    name: "Minimal Pro",
    tagline: "Editorial clarity",
    description:
      "Single-column rhythm, strong typographic hierarchy, and breathing room for senior ICs and designers.",
    gradientClass: "bg-gradient-to-br from-sky-500/25 via-background to-cyan-500/10",
  },
  {
    id: "modern-sidebar",
    name: "Modern Sidebar",
    tagline: "Skills-forward",
    description:
      "A structured rail for contact & skills, narrative body for impact — ideal for engineers and PMs.",
    gradientClass: "bg-gradient-to-br from-violet-500/20 via-background to-teal-500/15",
  },
  {
    id: "executive",
    name: "Executive",
    tagline: "Boardroom tone",
    description:
      "Weighted header, two-column story, leadership-forward — built for directors and principals.",
    gradientClass: "bg-gradient-to-br from-amber-500/15 via-background to-slate-500/20",
  },
] as const;

export const PRICING_PREVIEW_PLANS = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    blurb: "Build, edit, and preview — pay only when you export.",
    features: ["Full editor & sections", "Live preview", "Template switching"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Export Pro",
    price: "$12",
    cadence: "per resume PDF",
    blurb: "Unlock print-ready PDFs with premium layouts.",
    features: ["WeasyPrint-grade PDFs", "3 layout engines", "Metadata for downloads"],
    cta: "Get export access",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "Custom",
    cadence: "annual",
    blurb: "Shared workspace for agencies, bootcamps, and career services.",
    features: ["Seat management", "Invoicing", "Priority support"],
    cta: "Talk to sales",
    highlighted: false,
  },
] as const;

/** Feature rows for pricing comparison table (✓ / —). */
export const PLAN_COMPARISON = [
  { feature: "Editor & sections", starter: true, pro: true, teams: true },
  { feature: "Live preview", starter: true, pro: true, teams: true },
  { feature: "All 3 PDF templates", starter: false, pro: true, teams: true },
  { feature: "One-time PDF export", starter: false, pro: true, teams: true },
  { feature: "Priority render queue", starter: false, pro: true, teams: true },
  { feature: "Shared workspace & seats", starter: false, pro: false, teams: true },
  { feature: "Invoicing & SAML (optional)", starter: false, pro: false, teams: true },
] as const;

export const EXAMPLE_DEEP_DIVES = [
  {
    id: "minimal-pro",
    name: "Minimal Pro",
    audience: "Designers, writers, senior ICs",
    summary:
      "A single strong column with editorial rhythm — headline contact, tight summary, and experience blocks that breathe.",
    bullets: [
      "Optimized for skimming: clear job titles, dates, and impact lines",
      "Typography-forward: lets hierarchy do the heavy lifting",
      "Best when your story is craft-led, not credential-stacked",
    ],
  },
  {
    id: "modern-sidebar",
    name: "Modern Sidebar",
    audience: "Engineers, data, product",
    summary:
      "Skills and tools live in a dedicated rail; the main column carries narrative depth and metrics.",
    bullets: [
      "Great for keyword-rich skill lists without cluttering body copy",
      "Sidebar keeps contact + links always visible in PDF",
      "Balances ATS-friendly structure with human-readable flow",
    ],
  },
  {
    id: "executive",
    name: "Executive",
    audience: "Directors, VPs, consulting leads",
    summary:
      "Weighted header band and two-column body tuned for leadership arcs and org-scale outcomes.",
    bullets: [
      "Emphasizes scope: teams, budgets, regions, transformation",
      "Boardroom-appropriate tone — still scannable in under 60 seconds",
      "Pairs well with long-form impact bullets",
    ],
  },
] as const;

export const EXAMPLE_USE_CASES = [
  {
    title: "Pivoting roles",
    body: "Keep one master resume; tune summaries per vertical without rebuilding sections.",
  },
  {
    title: "Contract → FTE",
    body: "Highlight outcomes across engagements with consistent date formatting.",
  },
  {
    title: "Leadership promos",
    body: "Executive layout spotlights org size, mandates, and measurable change.",
  },
] as const;

export const BEFORE_AFTER = {
  before: {
    title: "Before",
    subtitle: "Dense blocks recruiters skim past",
    lines: [
      "Responsible for many things on the team and worked with cross-functional partners.",
      "Helped improve the system and did various tasks related to project goals.",
      "Used Agile and communicated with stakeholders on a regular basis.",
    ],
  },
  after: {
    title: "After",
    subtitle: "Outcome-led bullets with signal",
    lines: [
      "Led migration of billing core to event-driven architecture — cut reconciliation time by 38%.",
      "Partnered with Design + Legal to ship consent flows in 6 weeks across 4 markets.",
      "Ran weekly exec readouts with product & GTM; drove roadmap alignment on Q3 priorities.",
    ],
  },
} as const;
