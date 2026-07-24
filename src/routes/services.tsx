import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — NYtrc | Rural Entrepreneurship Development" },
      {
        name: "description",
        content:
          "Services designed for the development of rural entrepreneurs — CSC activation & revival, VLE training, and impact investment advisory across India's gram panchayats.",
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
    hook: "Turn Inactive Centres into Viable Businesses.",
    body: [
      "Between 35% and 47% of registered CSCs across India remain inactive, probably due to a structural failure. This service aims to address this through a three-tier process — Diagnose, Re-design, and Re-launch.",
      "Our district-level teams conduct physical verification and root-cause investigation through interaction with the Village Level Entrepreneurs, demand surveys, and service-gap analysis. Every revival plan is unique and tailor-made to be specific to the root cause.",
    ],
    features: [
      "Physical verification & root-cause audit",
      "Revenue gap and service basket analysis",
      "VLE retraining in local languages",
      "New service onboarding (banking, insurance, postal)",
      "Community demand generation campaigns",
      "90-day performance monitoring post-revival",
    ],
    cta: "Enquire About This Service",
  },
  {
    num: "02",
    title: "VLE Training & Capacity Building",
    hook: "Build the Skills That Make a CSC Profitable.",
    body: [
      "Most Village Level Entrepreneurs (VLEs) fail due to a lack of training, guidance, or aspiration. Our programme goes beyond web browsing — into handholding, grievance redressal, and community trust building.",
      "The programme is delivered in regional languages and in person at the block level. It includes digital follow-up modules and peer mentoring from high-earning Village Level Entrepreneurs in the same geography.",
    ],
    features: [
      "Portal mastery — G2C and B2C services",
      "Financial literacy and bookkeeping",
      "Insurance and banking product training",
      "Customer communication in local languages",
      "Complaint resolution and grievance handling",
      "Business planning for ₹20,000+ per month income",
    ],
    cta: "Register for Training",
  },
  {
    num: "03",
    title: "Impact Investment & CSR Advisory",
    hook: "Structure Rural Impact Programmes That Deliver Measurable Outcomes.",
    body: [
      "Rural entrepreneurship is one of the most effective vehicles for the Sustainable Development Goals — including ethical work, reduced inequality, and financial inclusion.",
      "We help impact funds, corporate foundations, and CSR offices design programmes that bring field-level credibility, existing district networks, and rigorous outcome frameworks.",
    ],
    features: [
      "Theory of Change design for rural programmes",
      "VLE cohort sponsorship structuring",
      "SROI (Social Return on Investment) measurement",
      "CSR-compliant programme documentation",
      "Quarterly impact reporting and field audits",
      "SDG alignment mapping and ESG reporting support",
    ],
    cta: "Discuss a Partnership",
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
            Services Designed for Development of Rural{" "}
            <span className="italic text-clay">Entrepreneurs</span>.
          </h1>
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
                </div>
                <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6">
                  {s.title}
                </h2>
                <p className="text-xl text-clay font-serif italic mb-8">{s.hook}</p>
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

      <Footer />
    </div>
  );
}
