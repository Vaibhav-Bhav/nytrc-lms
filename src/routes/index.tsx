import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NYtrc — Where Ambition Meets Opportunity" },
      {
        name: "description",
        content:
          "Activating and reviving Common Service Centres, training VLEs, integrating state e-services, and structuring rural impact investment across India's gram panchayats.",
      },
      { property: "og:title", content: "NYtrc — Where Ambition Meets Opportunity" },
      {
        property: "og:description",
        content:
          "Strengthening rural entrepreneurship across India. Empanelled training, CSC licence support, and LMS mentorship portal.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const stats = [
  { label: "CSC Operators Mentored", value: "10,000+" },
  { label: "Dormant CSCs Revived (Assam Pilot)", value: "40+" },
  { label: "Leadership Experience", value: "35+ Years" },
  { label: "Target Monthly VLE Earnings", value: "₹25,000+" },
];

const pillars = [
  {
    num: "01",
    title: "CSC Activation & Revival",
    description:
      "Addressing the 35%–47% inactivity rate across registered CSCs through ground-level audits, custom service re-design, local language retraining, and 90-day post-launch support.",
    link: "/services",
  },
  {
    num: "02",
    title: "VLE Capacity Building",
    description:
      "Transforming village youth and defence veterans into sustainable micro-entrepreneurs proficient in G2C/B2C portals, digital financial services, and customer relationship management.",
    link: "/services",
  },
  {
    num: "03",
    title: "Impact & CSR Advisory",
    description:
      "Structuring measurable rural impact initiatives for CSR funds, corporate foundations, and impact investors aligned with Sustainable Development Goals and SROI benchmarks.",
    link: "/subscription",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* Hero Section */}
      <header className="pt-16 md:pt-24 pb-20 px-6 border-b border-ink/10">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            NAVYUG Training & Research Consultants
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-10 text-ink">
            Where Ambition Meets{" "}
            <span className="italic text-clay">Opportunity</span>.
          </h1>
          <p className="max-w-3xl text-lg md:text-2xl text-ink/70 leading-relaxed border-l-2 border-clay/40 pl-6 mb-12">
            Activating and reviving Common Service Centres, training VLEs,
            integrating state e-services, and structuring rural impact investment
            across India's gram panchayats.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/subscription"
              className="bg-clay text-paper border border-clay px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-ink hover:border-ink transition-all shadow-sm"
            >
              Partner With Us →
            </Link>
            <Link
              to="/login"
              className="border border-ink bg-paper px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-paper transition-all"
            >
              Access LMS Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Impact Stats Banner */}
      <section className="bg-paper-warm/50 border-b border-ink/10 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 border border-ink/10">
          {stats.map((s) => (
            <div key={s.label} className="bg-paper p-8">
              <span className="font-serif text-3xl md:text-4xl text-clay italic font-light block mb-2">
                {s.value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60 font-semibold block">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* LMS Learning Portal Feature Banner */}
      <section className="py-20 px-6 bg-indigo text-paper border-b border-ink/10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block">
              NYtrc Learning Management System
            </span>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight">
              Interactive Digital Learning & Mentorship Portal
            </h2>
            <p className="text-paper/80 text-base md:text-lg leading-relaxed">
              Enrolled VLEs and trainees access structured 6–8 week online & hybrid
              curriculum modules, interactive courseware, progress tracking, and
              direct mentorship support through our dedicated LMS portal.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex bg-harvest text-indigo px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-paper transition-all"
              >
                Sign In to LMS Portal →
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 border border-paper/20 bg-indigo-dark/40 p-8 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-harvest font-bold border-b border-paper/10 pb-3">
              Portal Highlights
            </div>
            <ul className="space-y-3 text-sm text-paper/85">
              <li className="flex items-center gap-3">
                <span className="text-harvest font-mono text-xs">[✓]</span>
                <span>VLE Certification & Training Modules</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-harvest font-mono text-xs">[✓]</span>
                <span>G2C & B2C Service Onboarding Guides</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-harvest font-mono text-xs">[✓]</span>
                <span>1-Year Mentorship & Progress Dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-harvest font-mono text-xs">[✓]</span>
                <span>Multi-role Admin & Student Management</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Strategic Pillars */}
      <section className="py-24 px-6 border-b border-ink/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold block mb-3">
              What We Do
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Building Sustainable Rural Service Ecosystems
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <div
                key={p.num}
                className="border border-ink/10 bg-paper p-8 flex flex-col justify-between hover:border-clay/40 transition-colors"
              >
                <div>
                  <span className="font-serif text-4xl text-clay italic font-light block mb-4">
                    {p.num}
                  </span>
                  <h3 className="font-serif text-2xl mb-4 leading-tight">{p.title}</h3>
                  <p className="text-ink/75 leading-relaxed text-sm mb-8">
                    {p.description}
                  </p>
                </div>
                <Link
                  to={p.link}
                  className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold hover:underline"
                >
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6 bg-paper-warm/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold block">
            Start Your Journey
          </span>
          <h2 className="font-serif text-4xl md:text-6xl leading-tight">
            Ready to empower your local community?
          </h2>
          <p className="text-ink/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Join the NYtrc network of Village Level Entrepreneurs and transform your CSC
            into a thriving local digital enterprise.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/subscription"
              className="bg-clay text-paper border border-clay px-10 py-5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-ink hover:border-ink transition-all"
            >
              Enrol in VLE Mentorship Program →
            </Link>
            <Link
              to="/contact"
              className="border border-ink px-10 py-5 text-xs font-bold uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-paper transition-all"
            >
              Contact Our Office
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
