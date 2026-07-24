import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NYtrc — A Private Enterprise with a Public Purpose" },
      {
        name: "description",
        content:
          "Founded in Haryana in 2018 by NAVYUG Training and Research Consultants. Piloting with 40 VLEs; now operational across 12 states. Meet the people and principles behind NYtrc.",
      },
      { property: "og:title", content: "About NYtrc" },
      {
        property: "og:description",
        content:
          "A private LLP working alongside government programmes to bring private-sector discipline and accountability to last-mile rural enterprise development.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  {
    num: "01",
    title: "Ground Truth First",
    body: "No programme is designed without field-level data. What we build is shaped by what VLEs, citizens, and local administrators actually say — not by dashboards from Delhi.",
  },
  {
    num: "02",
    title: "Viability Over Numbers",
    body: "Success is measured by whether a VLE earns a dignified income — not by how many centres are registered on paper. A viable entrepreneur beats a hundred ghost CSCs.",
  },
  {
    num: "03",
    title: "Women at the Centre",
    body: "We actively prioritise women entrepreneurs. Women-led CSCs consistently show stronger community trust, higher service uptake, and more consistent monthly earnings.",
  },
  {
    num: "04",
    title: "Transparent Accountability",
    body: "Every partner — government, investor, donor — receives structured outcome reports. Performance indicators are independently verifiable, not narrated.",
  },
];

const team = [
  {
    initials: "PH",
    name: "Col Praveen Hooda, SM (Retd)",
    role: "Founder & CEO",
    bio: "30+ years in the Indian Army across Combat and Civil Engineering — roads, bridges, tunnels, buildings. Recipient of the Indian Road Congress's highest award for excellence in Civil Engineering, plus four service awards. Post-retirement, served as Executive Director at the National Highways & Infrastructure Development Corporation Ltd (NHIDCL), a PSU of MORTH. 35+ years of leadership across fields.",
  },
  {
    initials: "SS",
    name: "Dr Seshadri",
    role: "Founder & Director, Programmes",
    bio: "Took voluntary retirement as an officer in the insurance industry with deep exposure to insurance and microinsurance, followed by nine years in academia. Leads research and training programmes for rural development at NYtrc.",
  },
];

const partners = [
  "CSC SPV — MeitY",
  "NABARD",
  "SIDBI",
  "State NIC Units",
  "India Post",
  "SBI Business Correspondent Network",
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* Hero */}
      <header className="pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            Who We Are
          </span>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight mb-10">
            A Private Enterprise with a{" "}
            <span className="italic text-clay">Public Purpose</span>.
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-ink/70 leading-relaxed border-l-2 border-clay/30 pl-6">
            NYtrc is a private enterprise passionate about developing rural
            entrepreneurs to make them self-reliant — and to help society grow
            holistically and organically.
          </p>
        </div>
      </header>

      {/* Origin story — asymmetric split */}
      <section className="border-t border-ink/10 bg-paper-warm/40 py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
              Origin
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
              We Started Where the System Slowed Down.
            </h2>
            <div className="mt-8 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
              <div>Est. 2018 · Haryana</div>
              <div>Registered LLP · MSME</div>
              <div>Legal entity: NYTRC</div>
            </div>
            <Link
              to="/contact"
              className="mt-10 inline-flex bg-clay text-paper px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
            >
              Work With Us
            </Link>
          </div>

          <div className="lg:col-span-8 space-y-6 text-ink/80 text-lg leading-relaxed">
            <p>
              Founded in <strong>2018 in Haryana</strong> by a team of development
              professionals who had watched well-intentioned government schemes fail
              at the last mile — not because the ideas were wrong, but because
              ground-level entrepreneurship infrastructure was missing.
            </p>
            <p>
              We began with a single mission: help struggling and inactive CSC
              operators earn a living wage. What started as a pilot with{" "}
              <strong>40 VLEs</strong> in a handful of districts has grown into a
              full-service rural enterprise development firm operating across{" "}
              <strong>12 states</strong>.
            </p>
            <p>
              We are a registered LLP working{" "}
              <em>alongside — not instead of</em> government programmes, bringing
              private-sector discipline, speed, and accountability to public service
              delivery. Publicly we operate under the NYtrc brand; the
              underlying legal entity is{" "}
              <strong>NAVYUG Training and Research Consultants (NYTRC)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
              Our Values
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
              The Principles We Work By
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-ink/10 border border-ink/10">
            {values.map((v) => (
              <div key={v.num} className="bg-paper p-10">
                <span className="font-serif text-3xl italic text-clay block mb-4">
                  {v.num}
                </span>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-4">
                  {v.title}
                </h3>
                <p className="text-ink/70 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 bg-indigo text-paper">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-widest text-harvest font-semibold">
              Our People
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
              Leadership Team
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {team.map((t) => (
              <div key={t.name} className="border-t-2 border-harvest/60 pt-8">
                <div className="size-16 rounded-full border-2 border-harvest/60 grid place-items-center mb-6 font-serif text-xl text-harvest">
                  {t.initials}
                </div>
                <h3 className="font-serif text-2xl mb-1">{t.name}</h3>
                <div className="font-mono text-[10px] uppercase tracking-widest text-harvest mb-4">
                  {t.role}
                </div>
                <p className="text-sm text-paper/70 leading-relaxed">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
