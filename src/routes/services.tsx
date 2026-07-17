import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — NYtrc CSC Revival, VLE Training & Impact Advisory" },
      {
        name: "description",
        content:
          "Four services designed for rural enterprise at scale: CSC activation & revival, VLE training & capacity building, state e-service integration consulting, and impact investment & CSR advisory.",
      },
      { property: "og:title", content: "NYtrc Services" },
      {
        property: "og:description",
        content:
          "Between 35% and 47% of registered CSCs across India remain inactive. Our services are designed to fix that — service by service, district by district.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const services = [
  {
    num: "01",
    title: "CSC Activation & Revival Services",
    for: "For Government & NGOs",
    hook: "Turn Inactive Centres into Viable Enterprises.",
    body: [
      "Between 35% and 47% of registered CSCs across India remain inactive — a structural failure this service is built to address through a three-phase process: diagnose, redesign, relaunch.",
      "Our district teams conduct physical verification, root-cause interviews with VLEs, citizen demand mapping, and service gap analysis. Every revival plan is bespoke — not a template.",
    ],
    features: [
      "Physical verification & root cause audit",
      "Revenue gap and service basket analysis",
      "VLE retraining in local languages",
      "New service onboarding (banking, insurance, postal)",
      "Community demand generation campaigns",
      "90-day performance monitoring post-revival",
    ],
    targets: ["State SDAs", "District Collectors", "CSC SPV Partners", "NGOs & Foundations"],
    cta: "Enquire About This Service",
  },
  {
    num: "02",
    title: "VLE Training & Capacity Building",
    for: "For Entrepreneurs",
    hook: "Build the Skills That Make a CSC Profitable.",
    body: [
      "Most VLEs fail from lack of training, not lack of ambition. Our CSC Academy curriculum goes beyond portal navigation — managing footfall, cross-selling, grievances, and community trust.",
      "Delivered in regional languages, in person at the block level, with digital follow-up modules and peer mentoring from high-earning VLEs in the same geography.",
    ],
    features: [
      "Portal mastery — G2C and B2C services",
      "Financial literacy and bookkeeping",
      "Insurance and banking product training",
      "Customer communication in local languages",
      "Complaint resolution and grievance handling",
      "Business planning for ₹10,000+/month income",
    ],
    targets: ["New VLE Applicants", "Existing VLEs", "Women SHG Members", "Youth Aspirants"],
    cta: "Register for Training",
  },
  {
    num: "03",
    title: "State e-Service Integration Consulting",
    for: "For State Governments",
    hook: "Connect State Services to the Digital Seva Portal.",
    body: [
      "As of 2024, only 12 states had fully integrated citizen services into the Digital Seva Portal — leaving most CSC operators unable to deliver services their citizens actually need.",
      "We work with State IT Departments, NIC units, and SDAs to map service catalogues, resolve API and digital-signature barriers, and deliver a phased roadmap from pilot panchayats to state-wide rollout in 6–12 months.",
    ],
    features: [
      "State service catalogue audit",
      "DSP API integration roadmap",
      "Digital signature and PKI compliance support",
      "Pilot district deployment management",
      "VLE orientation for new state services",
      "Monitoring dashboard setup for state SDAs",
    ],
    targets: ["State IT Departments", "State SDAs", "NIC Units", "MeitY Empanelled Bodies"],
    cta: "Request a State Consultation",
  },
  {
    num: "04",
    title: "Impact Investment & CSR Advisory",
    for: "For Investors & Corporates",
    hook: "Structure Rural Impact Programmes That Deliver Measurable Outcomes.",
    body: [
      "Rural entrepreneurship is one of the most effective vehicles for SDG goals around decent work, reduced inequality, and financial inclusion.",
      "We help impact funds, corporate foundations, and CSR offices design programmes that go beyond cheque-writing — bringing field-level credibility, existing district networks, and rigorous outcome frameworks.",
    ],
    features: [
      "Theory of Change design for rural programmes",
      "VLE cohort sponsorship structuring",
      "SROI (Social Return on Investment) measurement",
      "CSR-compliant programme documentation",
      "Quarterly impact reporting and field audits",
      "SDG alignment mapping and ESG reporting support",
    ],
    targets: ["Impact Investors", "CSR Teams", "Development Finance", "NABARD / SIDBI Partners"],
    cta: "Discuss a Partnership",
  },
];

const models = [
  {
    tag: "Starter",
    title: "District-Level Pilot",
    features: [
      "Coverage of 1–3 blocks",
      "Up to 50 VLEs activated",
      "3-month programme cycle",
      "Training + service integration",
      "Monthly outcome report",
      "Dedicated field coordinator",
    ],
    cta: "Enquire Now",
    featured: false,
  },
  {
    tag: "Most Chosen",
    title: "State Partnership Programme",
    features: [
      "Multi-district deployment",
      "200–500 VLEs per phase",
      "6–12 month engagement",
      "Full DSP integration support",
      "Women-focused VLE cohort",
      "Quarterly independent audit",
    ],
    cta: "Start a Conversation",
    featured: true,
  },
  {
    tag: "Enterprise",
    title: "National Scale Deployment",
    features: [
      "Multi-state, multi-year",
      "1,000+ VLEs in scope",
      "Custom KPI framework",
      "Technology platform setup",
      "Board-level impact reporting",
      "Co-branding opportunities",
    ],
    cta: "Request a Proposal",
    featured: false,
  },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* Hero */}
      <header className="pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            What We Offer
          </span>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight mb-10">
            Services Designed for Rural{" "}
            <span className="italic text-clay">Enterprise</span> at Scale.
          </h1>
          <p className="max-w-2xl text-lg text-ink/70 leading-relaxed border-l-2 border-clay/30 pl-6">
            Four services, one throughline: turning registered CSCs into viable
            rural businesses that actually pay their operators a dignified income.
          </p>
        </div>
      </header>

      {/* Services list */}
      <section className="border-t border-ink/10">
        {services.map((s, i) => (
          <article
            key={s.num}
            className={`px-6 py-20 border-b border-ink/10 ${
              i % 2 === 1 ? "bg-paper-warm/40" : ""
            }`}
          >
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-serif text-6xl md:text-7xl text-clay italic font-light">
                    {s.num}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                    {s.for}
                  </span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6">
                  {s.title}
                </h2>
                <p className="text-xl text-clay font-serif italic mb-8">{s.hook}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {s.targets.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] uppercase tracking-wider border border-ink/20 px-3 py-1 text-ink/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="inline-flex bg-clay text-paper px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
                >
                  {s.cta}
                </Link>
              </div>

              <div className="lg:col-span-7 lg:pl-8 lg:border-l border-ink/10">
                <div className="space-y-4 text-ink/80 leading-relaxed mb-10">
                  {s.body.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                <div className="border-t border-ink/10 pt-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-4">
                    What's Included
                  </span>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                    {s.features.map((f) => (
                      <li
                        key={f}
                        className="text-sm text-ink/80 flex gap-3 items-baseline"
                      >
                        <span className="font-mono text-clay text-[10px] shrink-0">
                          [+]
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Engagement models */}
      <section className="py-24 px-6 bg-indigo text-paper">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-widest text-harvest font-semibold">
              Engagement Models
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight mb-6">
              How We Work Together
            </h2>
            <p className="text-paper/70 leading-relaxed max-w-2xl">
              We offer three engagement models depending on your scale, timeline,
              and objectives. All engagements include dedicated field support and
              outcome tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {models.map((m) => (
              <div
                key={m.title}
                className={`p-10 border ${
                  m.featured
                    ? "bg-paper text-ink border-harvest"
                    : "bg-transparent text-paper border-paper/15"
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest block mb-4 ${
                    m.featured ? "text-clay font-bold" : "text-harvest"
                  }`}
                >
                  {m.tag}
                </span>
                <h3 className="font-serif text-2xl mb-6">{m.title}</h3>
                <ul className="space-y-3 mb-10">
                  {m.features.map((f) => (
                    <li
                      key={f}
                      className={`text-sm leading-relaxed flex gap-3 items-baseline ${
                        m.featured ? "text-ink/80" : "text-paper/75"
                      }`}
                    >
                      <span
                        className={`font-mono text-[10px] shrink-0 ${
                          m.featured ? "text-clay" : "text-harvest"
                        }`}
                      >
                        —
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`inline-flex w-full justify-center px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                    m.featured
                      ? "bg-clay text-paper hover:brightness-110"
                      : "border border-paper/30 hover:bg-paper/10"
                  }`}
                >
                  {m.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
