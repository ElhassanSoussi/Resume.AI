/** Shared marketing copy — single source for landing, pricing, examples. */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const LANDING_FAQ: FaqItem[] = [
  {
    id: "free-vs-paid",
    question: "What is free vs paid?",
    answer:
      "The full editor, live preview, template switching, AI writing assist, tailoring into saved versions, cover letter drafts, and job tracker are included while you work. You pay once per resume when you want to unlock Stripe checkout for that document’s PDF export. After unlock, you can regenerate PDFs for that resume without paying again.",
  },
  {
    id: "export-modes",
    question: "What is the difference between ATS Export and Designed Export?",
    answer:
      "ATS Export renders a parser-friendly single-column layout (ATS Classic) for strict application portals. Designed Export uses the premium white-paper template you picked in the editor — best when a human reads the PDF first (email, referrals, or direct sends). You choose per generation; both are included in the same resume unlock.",
  },
  {
    id: "ai",
    question: "Does AI invent jobs or credentials?",
    answer:
      "No. AI suggests tighter phrasing, clearer bullets, and better structure from what you already wrote. You review every change in the editor. Nothing is presented as fact until you keep it.",
  },
  {
    id: "templates",
    question: "Can I change templates after I write content?",
    answer:
      "Yes. Your sections stay intact; you can switch among the designed templates in the library, preview instantly, and export in ATS or Designed mode when you are ready.",
  },
  {
    id: "data",
    question: "How is my data used?",
    answer:
      "Your resume content stays tied to your account for editing, preview, export, and the features you use. Payments are processed by Stripe — we do not store your card. Use the product in good faith for your own career materials.",
  },
  {
    id: "refund",
    question: "What if export fails?",
    answer:
      "If a technical issue prevents a successful PDF after a completed payment, contact support within 7 days with the resume and approximate time — we will re-run generation or make it right.",
  },
];

export const PRICING_FAQ_EXTRA: FaqItem[] = [
  {
    id: "stripe-price",
    question: "How much is the export unlock?",
    answer:
      "The amount is whatever you configure in Stripe for the single-resume product — you will see it clearly on the checkout page before you pay. The unlock applies to that one resume and includes both ATS and Designed PDF generation after purchase.",
  },
];

/** Outcome pillars — same story as the product (landing + app). */
export const STORY_PILLARS = [
  {
    id: "build",
    title: "Build a credible resume",
    body: "Guided creation or full editor: contact, summary, experience, skills, and education in a white-paper layout you control.",
  },
  {
    id: "ai",
    title: "Optimize, don’t invent",
    body: "AI tightens summaries, bullets, and skills from your facts. You stay in the loop — nothing ships until you are satisfied.",
  },
  {
    id: "tailor",
    title: "Tailor to real postings",
    body: "Paste a job description; get a saved version aligned to that role while your master draft stays intact.",
  },
  {
    id: "letters",
    title: "Cover letters that match the role",
    body: "Generate a structured draft from your resume plus the posting, choose tone, then edit before you send.",
  },
  {
    id: "track",
    title: "Know where you applied",
    body: "Lightweight tracker for company, role, status, dates, posting link, notes, and optional links to drafts.",
  },
  {
    id: "export",
    title: "Export and apply with confidence",
    body: "Readiness guidance, ATS or Designed PDF, Stripe checkout, then download — with clear next steps after export.",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Create your resume",
    description:
      "Start from the guided builder or jump into the editor. Autosave keeps progress as you fill sections.",
  },
  {
    step: "02",
    title: "Tune with AI (optional)",
    description:
      "Rewrite summary, optimize bullets, or run a full pass — always from your facts, always editable.",
  },
  {
    step: "03",
    title: "Tailor per employer",
    description:
      "Save role-specific versions from a job description so you can send targeted PDFs without duplicating work by hand.",
  },
  {
    step: "04",
    title: "Letters + applications",
    description:
      "Draft a cover letter from the same resume and posting, then log the application with status and follow-up dates.",
  },
  {
    step: "05",
    title: "Preview, unlock, export",
    description:
      "Check white-paper preview, review export readiness, pay once per resume in Stripe, then generate ATS or Designed PDFs.",
  },
] as const;

/** Showcase cards align with real template families in the product. */
export const TEMPLATE_SHOWCASE = [
  {
    id: "ats_classic",
    name: "ATS Classic",
    tagline: "Portal-first",
    description:
      "Single-column, restrained typography — the path you use with ATS Export for uploads that parse before a human sees you.",
    gradientClass: "bg-gradient-to-br from-slate-500/25 via-background to-sky-500/10",
  },
  {
    id: "modern_professional",
    name: "Modern Professional",
    tagline: "Recruiter balance",
    description:
      "Clean hierarchy and spacing for most business, product, and operations roles — ideal for Designed Export.",
    gradientClass: "bg-gradient-to-br from-violet-500/20 via-background to-teal-500/15",
  },
  {
    id: "executive_serif",
    name: "Executive Serif",
    tagline: "Leadership tone",
    description:
      "Formal serif presentation for senior ICs and leaders who want calm authority on the page.",
    gradientClass: "bg-gradient-to-br from-amber-500/15 via-background to-slate-500/20",
  },
] as const;

export const PRICING_PREVIEW_PLANS = [
  {
    name: "While you build",
    price: "$0",
    cadence: "no subscription",
    blurb: "Full editor, preview, AI assist, tailoring, cover letters, and job tracker — pay only when you unlock PDF export for a resume.",
    features: [
      "Unlimited drafts and template changes",
      "AI optimization (you approve edits)",
      "Tailored versions + cover letter drafts",
      "Application tracker",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "PDF export unlock",
    price: "Once",
    cadence: "per resume · at checkout",
    blurb:
      "Checkout shows the exact price before you pay. Unlock covers that resume only, then generate ATS or Designed PDFs whenever you need — including after edits.",
    features: [
      "ATS Export + Designed Export for that resume",
      "Print-ready white-paper PDFs",
      "Regenerate after edits at no extra charge",
      "Receipts in Billing",
    ],
    cta: "Get started",
    highlighted: true,
  },
] as const;

/** Feature rows for pricing comparison (Starter vs Export unlock). */
export const PLAN_COMPARISON = [
  { feature: "Editor, preview, templates", starter: true, export: true },
  { feature: "AI writing & optimization", starter: true, export: true },
  { feature: "Tailor + version history", starter: true, export: true },
  { feature: "Cover letters + job tracker", starter: true, export: true },
  { feature: "PDF export (ATS + Designed)", starter: false, export: true },
  { feature: "Unlimited PDF regenerations after unlock", starter: false, export: true },
] as const;

export const EXAMPLE_DEEP_DIVES = [
  {
    id: "ats_classic",
    name: "ATS Classic",
    audience: "High-volume applications, strict portals",
    summary:
      "When parsers gate your first impression, this layout keeps structure predictable: standard flow, readable type, minimal decoration.",
    bullets: [
      "Pair with ATS Export in the product for the safest upload path",
      "Single column so parsers see headings and bullets in order",
      "Still human-readable when a recruiter opens the same file",
    ],
  },
  {
    id: "modern_professional",
    name: "Modern Professional",
    audience: "Most business, product, and ops roles",
    summary:
      "The default designed path for people who send PDFs to humans first — balanced spacing, clear hierarchy, white-paper polish.",
    bullets: [
      "Designed Export preserves your chosen template and spacing",
      "Strong for referrals, networking, and direct email",
      "Switch templates without rewriting content",
    ],
  },
  {
    id: "executive_serif",
    name: "Executive Serif",
    audience: "Leadership, strategy, senior IC",
    summary:
      "Serif-forward presentation with a quieter, high-trust tone — room for scope, mandates, and long-form impact where you need it.",
    bullets: [
      "Weighted header and formal rhythm for senior readers",
      "Pairs with achievement-style bullets you already own",
      "Export when readiness checks look solid",
    ],
  },
] as const;

export const EXAMPLE_USE_CASES = [
  {
    title: "Same resume, two destinations",
    body: "Generate ATS PDF for the portal and a Designed PDF for the hiring manager — one unlock, two modes.",
  },
  {
    title: "One master, many employers",
    body: "Tailor versions from the job description; keep dates and titles consistent while wording flexes per role.",
  },
  {
    title: "From apply to follow-up",
    body: "Log the company and role, attach posting URL and dates, then return after interviews without digging through email.",
  },
] as const;

export const BEFORE_AFTER = {
  before: {
    title: "Generic duties",
    subtitle: "What recruiters skim past in seconds",
    lines: [
      "Responsible for many things on the team and worked with cross-functional partners.",
      "Helped improve the system and did various tasks related to project goals.",
      "Used Agile and communicated with stakeholders on a regular basis.",
    ],
  },
  after: {
    title: "Clear outcomes",
    subtitle: "Same career — evidence a reader can remember",
    lines: [
      "Led billing platform migration to event-driven architecture — cut reconciliation time by 38%.",
      "Partnered with Design and Legal to ship consent flows in six weeks across four markets.",
      "Ran weekly exec readouts with product and GTM; aligned roadmap on Q3 priorities.",
    ],
  },
} as const;
