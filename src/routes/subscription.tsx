import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Welcome to the NYtrc Family — Training & Mentorship" },
      {
        name: "description",
        content:
          "6–8 weeks of online/hybrid training plus one year of mentorship to help you obtain a CSC licence and build a viable rural digital service enterprise earning ₹25,000+ per month.",
      },
      { property: "og:title", content: "Welcome to the NYtrc Family" },
      {
        property: "og:description",
        content:
          "Rural entrepreneurship through technology and social empowerment. Structured training, CSC licence support, and continuous mentorship.",
      },
      { property: "og:url", content: "/subscription" },
    ],
    links: [{ rel: "canonical", href: "/subscription" }],
  }),
  component: SubscriptionPage,
});

const requirements = [
  {
    num: "01",
    title: "Eligibility for a CSC VLE Licence",
    intro:
      "According to the CSC 2.0 guidelines, an applicant should generally:",
    items: [
      "Be at least 18 years of age.",
      "Have passed at least the 10th standard from a recognised board.",
      "Be able to read and write the local language.",
      "Have basic knowledge of English.",
      "Possess basic computer skills.",
      "Have a valid Aadhaar Card or Virtual ID.",
      "Have a valid PAN.",
      "Be willing to serve as a Village Level Entrepreneur in the local community.",
    ],
  },
  {
    num: "02",
    title: "Infrastructure Requirements",
    intro: "A successful CSC should have:",
    items: [
      "Working space of approximately 100–150 sq ft or more.",
      "Computer or laptop with updated software.",
      "High-speed broadband or reliable internet connection.",
      "Laser printer.",
      "Colour printer.",
      "Scanner.",
      "Webcam.",
      "Biometric fingerprint scanner.",
      "Iris scanner, where applicable.",
      "UPS or inverter with power backup.",
      "Good lighting.",
      "Customer waiting area.",
      "CCTV (recommended for security).",
      "Secure document storage.",
    ],
  },
  {
    num: "03",
    title: "Essential Documents",
    intro: "The Village Level Entrepreneur should maintain:",
    items: [
      "Aadhaar Card",
      "PAN Card",
      "Bank account",
      "Passport-size photographs",
      "Educational qualification certificates",
      "Address proof",
      "Mobile number linked with Aadhaar",
      "Email ID",
      "Police verification, if required for certain services",
    ],
  },
  {
    num: "04",
    title: "Digital Skills",
    intro: "A CSC operator should be proficient in:",
    items: [
      "Computer operations",
      "Microsoft Office",
      "Internet browsing",
      "Online application processing",
      "Digital payments",
      "Email communication",
      "Document scanning and uploading",
      "Cybersecurity and data privacy",
    ],
  },
  {
    num: "05",
    title: "Business Skills",
    intro: "Running a CSC as a profitable enterprise requires:",
    items: [
      "Customer Relationship Management",
      "Communication skills",
      "Marketing and promotion",
      "Financial management",
      "Bookkeeping",
      "Inventory management",
      "Record maintenance",
      "Problem-solving",
    ],
  },
  {
    num: "06",
    title: "Government Services Knowledge",
    intro:
      "A successful VLE should understand and be aware of Aadhaar, PAN, passport, driving licence, voter ID, income/caste/residence certificates, pension schemes, PM-Kisan, Ayushman Bharat, labour registration, utility bill payments, digital banking, insurance, and education services. CSCs function as digital access points delivering government, financial, educational, agricultural, healthcare, and private-sector services.",
    items: [],
  },
];

const costs = [
  ["Computer / Laptop", "₹20,000 – ₹30,000"],
  ["Printer and Scanner", "₹10,000 – ₹15,000"],
  ["Biometric Devices", "₹5,000 – ₹8,000"],
  ["Furniture", "₹5,000 – ₹10,000"],
  ["Internet Setup", "₹1,000 – ₹2,500"],
  ["UPS / Inverter", "₹5,000 – ₹15,000"],
  ["Miscellaneous", "₹5,000 – ₹7,000"],
  ["Estimated Total Investment", "≈ ₹50,000 – ₹1 lakh"],
];

const incomeSources = [
  "Government service commissions",
  "Banking Correspondent services",
  "Insurance commissions",
  "Pension enrolments",
  "Utility bill payments",
  "PAN services",
  "Passport services",
  "Income-tax filing",
  "Railway ticket booking",
  "Bus ticket booking",
  "Online examination registrations",
  "Digital literacy programmes",
  "Telemedicine",
  "E-commerce services",
  "Skill-development programmes",
];

const serviceStandards = [
  "Timely service delivery",
  "Transparency in charges",
  "Professional behaviour",
  "Clean and organised office",
  "Quick grievance resolution",
  "Maintaining customer records",
  "Regular follow-up",
];

const compliance = [
  "Follow CSC and government guidelines.",
  "Protect customer data and privacy.",
  "Maintain accurate transaction records.",
  "Display approved service charges.",
  "Use only authorised software and portals.",
  "Renew registrations and certifications as required.",
];

const successFactors = [
  "Operate for extended business hours.",
  "Offer 40–60 or more services rather than relying on only a few.",
  "Build strong relationships with local government offices, banks, schools, and community organisations.",
  "Conduct awareness campaigns in nearby villages.",
  "Maintain high service quality and trust.",
  "Continuously learn about newly introduced government schemes and digital services.",
];

function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* Hero */}
      <header className="pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            Programme
          </span>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight mb-10">
            Welcome to the <span className="italic text-clay">NYtrc Family</span>.
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-ink/70 leading-relaxed border-l-2 border-clay/30 pl-6">
            Rural entrepreneurship through technology and social empowerment.
          </p>
        </div>
      </header>

      {/* Programme overview */}
      <section className="border-t border-ink/10 bg-paper-warm/40 py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
          <FactCard label="Training Schedule" value="6–8 weeks training + 1 year of mentorship" />
          <FactCard label="Training Mode" value="Online / Hybrid" />
          <FactCard label="Trainee Qualifications" value="10th standard pass and above" />
        </div>
      </section>

      {/* Objective */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-ink/80 text-lg leading-relaxed">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold block">
            Training Objective
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
            Empower trainees to establish and manage successful rural enterprises.
          </h2>
          <p>
            Our objective is to equip participants with a comprehensive
            understanding of rural entrepreneurship — along with the knowledge,
            practical skills, and confidence required to establish and manage
            successful rural enterprises.
          </p>
          <p>
            Through structured training, we prepare participants to obtain a{" "}
            <strong>Common Service Centre (CSC) licence</strong>. The CSC scheme
            operates under the Ministry of Electronics and Information Technology
            (MeitY), overseen by CSC e-Governance Services India Limited — a
            Special Purpose Vehicle incorporated by MeitY to facilitate the
            delivery of digital and e-governance services to citizens.
          </p>
          <p>
            We also develop sustainable income-generating opportunities and help
            trainees achieve a respectable monthly income. Beyond certification,
            we provide continuous mentoring and handholding support to help
            trainees successfully establish, operate, and grow their CSCs into
            viable and sustainable rural service enterprises.
          </p>
        </div>
      </section>

      {/* Requirements */}
      <section className="border-t border-ink/10 bg-paper-warm/40 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
              Requirements
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
              What It Takes to Run a CSC
            </h2>
            <p className="mt-6 text-ink/70 leading-relaxed">
              Obtaining a licence through VLE registration is only the first
              step. Long-term success depends on meeting legal, technical,
              operational, financial, and customer-service requirements.
            </p>
          </div>

          <div className="space-y-10">
            {requirements.map((r) => (
              <div key={r.num} className="bg-paper border border-ink/10 p-8 md:p-10">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-serif text-4xl text-clay italic font-light">
                    {r.num}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl leading-tight">
                    {r.title}
                  </h3>
                </div>
                <p className="text-ink/80 mb-5">{r.intro}</p>
                {r.items.length > 0 && (
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {r.items.map((i) => (
                      <li key={i} className="text-sm text-ink/80 flex gap-3 items-baseline">
                        <span className="font-mono text-clay text-[10px] shrink-0">[+]</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial requirements */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
            07 · Financial Requirements
          </span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-8 leading-tight">
            Approximate Setup Costs
          </h2>
          <div className="border border-ink/10">
            {costs.map(([item, cost], i) => (
              <div
                key={item}
                className={`grid grid-cols-[1fr_auto] px-6 py-4 gap-6 items-baseline ${
                  i === costs.length - 1
                    ? "bg-paper-warm font-serif text-ink"
                    : "text-ink/80"
                } ${i > 0 ? "border-t border-ink/10" : ""}`}
              >
                <span>{item}</span>
                <span className="font-mono text-sm">{cost}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income sources */}
      <section className="border-t border-ink/10 bg-paper-warm/40 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
            08 · Income Sources
          </span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-8 leading-tight">
            How a Well-Managed CSC Earns
          </h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {incomeSources.map((s) => (
              <li key={s} className="text-sm text-ink/80 flex gap-3 items-baseline">
                <span className="font-mono text-clay text-[10px] shrink-0">[+]</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-ink/70 italic">
            Diversifying services is widely regarded by CSC operators as an
            effective way to improve monthly earnings.
          </p>
        </div>
      </section>

      {/* Standards + Compliance */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
              09 · Customer Service Standards
            </span>
            <h3 className="font-serif text-2xl md:text-3xl mt-3 mb-6">
              What Trusted VLEs Do Consistently
            </h3>
            <ul className="space-y-2">
              {serviceStandards.map((s) => (
                <li key={s} className="text-ink/80 flex gap-3 items-baseline">
                  <span className="font-mono text-clay text-[10px] shrink-0">[+]</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
              10 · Compliance Requirements
            </span>
            <h3 className="font-serif text-2xl md:text-3xl mt-3 mb-6">
              Operating Within the Rules
            </h3>
            <ul className="space-y-2">
              {compliance.map((s) => (
                <li key={s} className="text-ink/80 flex gap-3 items-baseline">
                  <span className="font-mono text-clay text-[10px] shrink-0">[+]</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Success factors */}
      <section className="border-t border-ink/10 bg-indigo text-paper py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-widest text-harvest font-semibold">
            Success Factors
          </span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-8 leading-tight">
            What the Best-Performing CSCs Do Differently
          </h2>
          <ul className="space-y-3">
            {successFactors.map((s) => (
              <li key={s} className="flex gap-4 items-baseline text-paper/85 leading-relaxed">
                <span className="font-mono text-harvest text-[10px] shrink-0">[+]</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-ink/80 text-lg leading-relaxed">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold">
            Our Commitment
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
            A trusted partner throughout your entrepreneurial journey.
          </h2>
          <p>
            At NYTRC, our support extends far beyond training. We provide
            continuous handholding, mentoring, and practical guidance at every
            stage of establishing and operating your Common Service Centre.
          </p>
          <p>
            Our objective is to help you transform your CSC into a successful
            rural digital service enterprise capable of generating a monthly
            income of <strong>₹25,000 or more</strong> — depending on your
            commitment, service portfolio, and local market opportunities.
          </p>
        </div>
      </section>

      {/* Renewal Policy */}
      <section className="border-t border-ink/10 bg-paper-warm/40 py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-ink/80 text-lg leading-relaxed">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold block">
            Renewal Policy
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
            One year of mentorship — with the option to continue.
          </h2>
          <p>
            Throughout your one-year membership with us, our mentors will assist
            you in navigating the initial setup process, selecting the right mix
            of services, developing business strategies, overcoming operational
            challenges, and building a sustainable customer base. After the
            expiry of the one-year membership, the member can extend the
            membership by paying the renewal fees.
          </p>
          <p>
            With NYTRC by your side, you will never have to build your
            enterprise alone — we are dedicated to supporting your progress,
            strengthening your capabilities, and helping you achieve long-term
            success.
          </p>
        </div>
      </section>

      {/* Register CTA */}
      <section className="py-24 px-6 border-t border-ink/10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-clay font-bold block mb-4">
            Ready to Begin
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-8">
            Take the first step toward your{" "}
            <span className="italic text-clay">rural enterprise</span>.
          </h2>
          <Link
            to="/contact"
            className="inline-flex bg-clay text-paper px-10 py-5 text-sm font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
          >
            Proceed to Register →
          </Link>
          <p className="mt-8 text-sm text-ink/60">
            Prefer to speak with us? Call{" "}
            <a href="tel:+919779535329" className="text-clay hover:underline">
              +91 97795 35329
            </a>{" "}
            (Mon–Sat · 9 AM–6 PM IST).
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-8">
      <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-3">
        {label}
      </span>
      <p className="font-serif text-xl text-ink leading-snug">{value}</p>
    </div>
  );
}
