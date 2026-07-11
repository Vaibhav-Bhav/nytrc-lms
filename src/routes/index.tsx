import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import heroWoodblock from "@/assets/hero-woodblock.jpg";
import networkMap from "@/assets/network-map.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GramUdyam — Where Village Ambition Meets Opportunity" },
      {
        name: "description",
        content:
          "Activating and reviving Common Service Centres, training VLEs, integrating state e-services, and structuring rural impact investment across India's gram panchayats.",
      },
      { property: "og:title", content: "GramUdyam — Rural Entrepreneurship at Scale" },
      {
        property: "og:description",
        content:
          "800+ CSCs activated across 12 states. 63% women VLEs. ₹8,200 average monthly VLE income. Evidence-first rural enterprise development.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const heroStats = [
  { label: "CSC Centres Nationwide", value: "5.8L+" },
  { label: "Gram Panchayats Targeted", value: "2.5L" },
  { label: "Loans Disbursed via CSCs", value: "₹3000Cr" },
  { label: "Monthly Transactions", value: "335L+" },
];

const tickerItems = [
  "VLE Capacity Building",
  "CSC Activation & Revival",
  "Rural Financial Inclusion",
  "Women Entrepreneurship",
  "Digital Seva Integration",
  "Agri-Tech Linkages",
  "B2C Service Expansion",
  "Impact Investment Advisory",
];

const pillars = [
  {
    num: "01",
    kicker: "Activate",
    title: "Revive Dormant Centres",
    body: "We identify struggling and inactive CSCs, diagnose root causes on the ground, and deploy targeted revival plans — service basket expansion, VLE retraining, local demand generation.",
    marks: ["Demand mapping", "Service gap analysis", "VLE retraining"],
  },
  {
    num: "02",
    kicker: "Connect",
    title: "Integrate Services",
    body: "We bridge CSC operators with state e-service portals, banking correspondents, insurance providers, and agri-platforms — turning a single-service kiosk into a multi-revenue village hub.",
    marks: ["Banking terminals", "Insurance onboarding", "Portal integration"],
  },
  {
    num: "03",
    kicker: "Sustain",
    title: "Scale for Growth",
    body: "Performance monitoring, peer mentoring, and community linkages so entrepreneurs grow and earn sustainably — not just launch and go quiet three months later.",
    marks: ["Peer mentoring", "Outcome tracking", "Community linkage"],
  },
];

const impactStats = [
  { value: "800+", label: "CSCs Activated" },
  { value: "12", label: "States Operational" },
  { value: "63%", label: "Women VLE Enrolment" },
  { value: "₹8,200", label: "Avg Monthly VLE Income" },
];

const audiences = [
  {
    kicker: "For Entrepreneurs",
    title: "Aspiring VLEs & Rural Self-Starters",
    body: "Training, tools, and connections to open or expand a CSC and diversify into insurance, banking, and agri-services.",
  },
  {
    kicker: "For Government",
    title: "State Bodies & District Administrations",
    body: "Partnering with SDAs, DeGS units, and state IT departments to identify, revive, and monitor CSC performance with full Digital Seva Portal integration.",
  },
  {
    kicker: "For Investors & CSR",
    title: "Impact Funds & Corporate Foundations",
    body: "Structuring last-mile investment and CSR programmes with rigorous outcome tracking against SDG and Digital India benchmarks.",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* Hero */}
      <header className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 animate-ink-in">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
              Rural Entrepreneurship · CSC Services · Inclusive Growth
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mb-8">
              Where Village <br />
              <span className="italic font-light text-clay">Ambition</span> Meets{" "}
              <br />
              Opportunity
            </h1>
            <p className="max-w-xl text-lg text-ink/70 leading-relaxed border-l-2 border-clay/30 pl-6">
              GramUdyam partners with rural entrepreneurs, government programmes, and
              impact investors to build a thriving ecosystem of grassroots enterprise
              across India's villages and gram panchayats.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/services"
                className="bg-clay text-paper px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
              >
                Explore Our Services
              </Link>
              <Link
                to="/contact"
                className="border border-ink/25 px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-ink/5 transition-all"
              >
                Partner With Us
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block animate-ink-in">
            <div className="relative border border-clay/15 bg-clay/5 p-3">
              <img
                src={heroWoodblock}
                alt="Woodblock print of a stylized Indian village landscape — huts, peepal tree, terraced fields."
                width={800}
                height={1008}
                className="w-full h-auto aspect-[4/5] object-cover"
              />
              <span className="absolute top-4 right-4 bg-paper/90 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-clay">
                Field Archive 01
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Ledger stats bar */}
      <section className="border-y border-ink/10 bg-paper-warm/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 lg:divide-x lg:divide-ink/10">
            {heroStats.map((s, i) => (
              <div key={s.label} className={i > 0 ? "lg:pl-8" : "lg:pr-8"}>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 block mb-2">
                  {s.label}
                </span>
                <span className="font-serif text-4xl md:text-5xl text-ink">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling ticker */}
      <div className="bg-ink text-paper/90 py-4 overflow-hidden border-b border-ink">
        <div className="flex whitespace-nowrap animate-ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="font-mono text-xs uppercase tracking-[0.25em] px-8 shrink-0"
            >
              {item} <span className="text-harvest ml-8">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Pillars */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
              What We Do
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
              Three Pillars of Rural Enterprise Development
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
            {pillars.map((p) => (
              <div key={p.num} className="bg-paper p-10">
                <span className="font-serif text-2xl italic text-clay mb-6 block underline underline-offset-8 decoration-1">
                  {p.num}. {p.kicker}
                </span>
                <h3 className="font-bold uppercase tracking-widest text-xs mb-4">
                  {p.title}
                </h3>
                <p className="text-sm text-ink/70 leading-relaxed mb-6">{p.body}</p>
                <ul className="space-y-2 pt-4 border-t border-ink/10">
                  {p.marks.map((m) => (
                    <li
                      key={m}
                      className="text-[11px] font-mono text-ink/50 uppercase tracking-wider"
                    >
                      [+] {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact bar — full bleed textured band */}
      <section className="bg-clay text-paper py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 ledger-rule opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="mb-12">
            <span className="font-mono text-[11px] uppercase tracking-widest text-harvest font-semibold">
              Field Report · Ledger Entry
            </span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">
              What we have on the ground, in numbers we can defend.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {impactStats.map((s) => (
              <div key={s.label} className="border-t-2 border-harvest pt-4">
                <div className="font-serif text-5xl md:text-6xl mb-3">{s.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-paper/80">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="bg-indigo text-paper py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-harvest">
              Who We Serve
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-6 leading-tight">
              Built for Every Stakeholder in the Rural Ecosystem
            </h2>
            <div className="mt-12 border border-paper/10 p-3 bg-indigo">
              <img
                src={networkMap}
                alt="Abstract network map of India in gold linework on indigo, representing GramUdyam's district footprint."
                width={1200}
                height={608}
                loading="lazy"
                className="w-full h-auto aspect-[2/1] object-cover"
              />
            </div>
          </div>

          <div className="space-y-10 lg:pt-12">
            {audiences.map((a, i, arr) => (
              <div
                key={a.kicker}
                className={
                  i < arr.length - 1 ? "border-b border-paper/10 pb-10" : ""
                }
              >
                <h4 className="text-harvest font-mono text-xs uppercase tracking-[0.2em] mb-4">
                  {a.kicker}
                </h4>
                <p className="text-xl font-serif mb-4">{a.title}</p>
                <p className="text-sm text-paper/70 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial as stamped seal */}
      <section className="py-28 px-6 bg-paper-warm/40">
        <div className="max-w-3xl mx-auto text-center relative">
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-[0.09] pointer-events-none"
            aria-hidden="true"
          >
            <div className="size-40 border-4 border-clay rounded-full flex items-center justify-center rotate-[-8deg]">
              <span className="font-serif text-3xl text-clay font-black uppercase tracking-widest">
                Verified
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-clay block mb-8 relative">
            District Field Report · Sitamarhi, Bihar
          </span>
          <blockquote className="font-serif text-2xl md:text-3xl leading-snug mb-8 text-balance">
            "Before GramUdyam's intervention, I had registered my CSC but had no idea
            how to bring in regular income. Within six months of their training and
            service integration support, I now earn over{" "}
            <span className="text-clay">₹12,000 a month</span> serving my entire
            panchayat."
          </blockquote>
          <cite className="not-italic">
            <span className="block font-bold uppercase tracking-widest text-xs text-ink">
              Savitri Devi
            </span>
            <span className="block font-mono text-[10px] text-ink/50 mt-1 uppercase tracking-wider">
              VLE, Sitamarhi District, Bihar
            </span>
          </cite>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 px-6 border-t border-ink/10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
            Get Started Today
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 mb-10 leading-tight">
            Ready to Build Something Lasting in Rural India?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-clay text-paper px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
            >
              Talk to Our Team
            </Link>
            <Link
              to="/services"
              className="border border-ink/25 px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-ink/5 transition-all"
            >
              See All Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
