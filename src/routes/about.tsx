import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NYtrc — A Private Entrepreneurship for Social Empowerment" },
      {
        name: "description",
        content:
          "NYTRC was registered in April 2026 in Gurgaon, Haryana. We strive to strengthen the rural entrepreneurship ecosystem — empowering unemployed youth and retired defence personnel to become self-reliant.",
      },
      { property: "og:title", content: "About NYtrc" },
      {
        property: "og:description",
        content:
          "A private LLP working to bring private-sector discipline, speed, and accountability to public service delivery in rural India.",
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
    bio: "More than 30 years of experience in the Indian Army in Combat and Civil Engineering infrastructure — roads, bridges, tunnels, and buildings. Completed the Certified Independent Director examination from IICA in 2026. Recipient of the Indian Road Congress's highest award for excellence in Civil Engineering, along with four service awards while serving in the Indian Army. After hanging up his Olive Green, he served as Executive Director at the National Highways & Infrastructure Development Corporation Limited, a PSU of the Ministry of Road Transport and Highways. With over 35 years of leadership across diverse fields, he aims to give back for the betterment of society.",
  },
  {
    initials: "SS",
    name: "Dr Seshadri",
    role: "Founder & Director, Programmes",
    bio: "A dedicated academician and industry veteran with 29 years of diverse experience. Completed the Certified Independent Director examination from IICA in 2025. Holds a Ph.D. in Management specialising in Rural Entrepreneurship, complemented by an LL.M. in International Business and Finance Law. Keen on bridging the gap between industry practice and academic theory in Human Resources, Management, Information Technology, and Legal subjects. Passionate about rural entrepreneurship, he took voluntary retirement as an officer in the insurance industry with vast exposure to insurance and microinsurance, followed by nine years in academia. Leads research and training programmes for rural development at NYtrc.",
  },
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
            A Private Entrepreneurship for{" "}
            <span className="italic text-clay">Social Empowerment</span>.
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-ink/70 leading-relaxed border-l-2 border-clay/30 pl-6">
            We strive to strengthen the rural entrepreneurship ecosystem.
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
              We Started Where the System Paused.
            </h2>
            <div className="mt-8 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
              <div>Registered April 2026</div>
              <div>Gurgaon · Haryana</div>
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
              NYTRC was registered in <strong>April 2026</strong>, with its
              registered office in <strong>Gurgaon, Haryana</strong>, by a team of
              professionals having vast experience of more than 35 years in
              multifaceted roles in the Government of India.
            </p>
            <p>
              During our journey, we could interact with various segments of
              society, keeping close focus on our rural areas. In our research, we
              identified voids in the implementation of various central and state
              government schemes — largely due to a lack of information and
              publicity to make the common citizen aware of these schemes and
              their potential.
            </p>
            <p>
              We began with a single mission: to empower unemployed youth and
              retired defence personnel below officer rank and make them
              self-reliant. With this mission in mind, we made a humble start by
              first identifying struggling and inactive Common Service Centre
              operators and equipping them to earn a decent monthly income —
              helping stop rural migration to urban areas that deprives families
              of working on their agricultural lands concurrently.
            </p>
            <p>
              What started as a pilot in <strong>2018</strong> involved the
              identification of <strong>40 dormant Village Level Entrepreneurs</strong>{" "}
              across certain districts of <strong>Assam</strong>, mentored to
              restart their rural entrepreneurship journey. During this
              interaction, we realised the problems being faced by aspiring rural
              entrepreneurs — which ultimately prompted us to start this venture.
            </p>
            <p>
              We are a registered LLP working to bring private-sector discipline,
              speed, and accountability to public service delivery. Publicly we
              operate under the NYtrc brand; the underlying legal entity is{" "}
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
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl">
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
