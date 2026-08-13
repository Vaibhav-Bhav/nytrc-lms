import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { DISTRICTS_BY_STATE, STATES } from "@/lib/india-districts";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NYtrc — Let's Build Something Together" },
      {
        name: "description",
        content:
          "Launch a programme, revive inactive CSCs, enrol for VLE training, or structure a rural impact investment. Our team responds within two working days.",
      },
      { property: "og:title", content: "Contact NYtrc" },
      {
        property: "og:description",
        content:
          "Head office in Haryana. Field offices in Patna, Ranchi, Bhubaneswar, Jaipur, Lucknow, Bhopal.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const roles = [
  "Business Associate",
  "Aspiring VLE / Rural Entrepreneur",
  "Existing CSC Operator",
  "Impact Investor / Fund Manager",
  "Corporate / CSR Team",
  "NGO / Development Organisation",
  "Researcher / Academic",
];

const fieldOffices = ["Guwahati", "Mohali", "Zirakpur", "Panchkula", "Una (Amba)", "Secunderabad"];

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const districts = selectedState ? (DISTRICTS_BY_STATE[selectedState] ?? []) : [];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* Hero */}
      <header className="pt-16 pb-16 px-6">
        <div className="max-w-5xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            Get In Touch
          </span>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
            Let's Build the <span className="italic text-clay">Future</span> Together.
          </h1>
        </div>
      </header>

      {/* Contact grid */}
      <section className="border-t border-ink/10 px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          {/* Left: intro + channels */}
          <div className="lg:col-span-5 space-y-12">
            <p className="text-lg text-ink/80 leading-relaxed border-l-2 border-clay/30 pl-6">
              Whether you want to launch a programme, revive inactive CSCs, enrol for VLE training,
              or structure a rural impact investment — our team is ready to listen and respond
              within two working days.
            </p>

            <div className="border-t border-ink/10 pt-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-4">
                Head Office
              </span>
              <address className="not-italic text-ink/80 leading-relaxed">
                <p className="font-serif text-lg text-ink">
                  NAVYUG Training and Research Consultants
                </p>
                <p>Haryana, India</p>
              </address>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-4">
                Field Offices
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-ink/80">
                {fieldOffices.map((c, i) => (
                  <span key={c} className="font-serif text-lg">
                    {c}
                    {i < fieldOffices.length - 1 && <span className="text-clay/40 ml-6">·</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-3">
                Email
              </span>
              <a
                href="mailto:navyugconsultants2@gmail.com"
                className="font-serif text-xl text-ink hover:text-clay transition-colors break-all"
              >
                navyugconsultants2@gmail.com
              </a>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-3">
                Phone
              </span>
              <a
                href="tel:+919779535329"
                className="font-serif text-xl text-ink hover:text-clay transition-colors"
              >
                +91 97795 35329
              </a>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mt-2">
                Mon–Sat · 9 AM–6 PM IST
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            <div className="border border-ink/15 bg-paper-warm/30 p-8 md:p-12">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-2">
                Send Us a Message
              </span>
              <h2 className="font-serif text-3xl mb-2">Fill in the form below</h2>
              <p className="text-sm text-ink/60 mb-10">
                Our team will get back to you within two working days.
              </p>

              {submitted ? (
                <div className="border-2 border-clay/40 bg-paper p-10 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-3">
                    Received · Ledger Entry Filed
                  </span>
                  <h3 className="font-serif text-2xl mb-3">Thank you — we've got it.</h3>
                  <p className="text-ink/70">
                    A member of our team will be in touch within two working days.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Field label="First Name" name="firstName" placeholder="Rajesh" required />
                    <Field label="Last Name" name="lastName" placeholder="Kumar" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Field
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                    <Field label="Phone" name="phone" type="tel" placeholder="+91 97795 35329" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <SelectField
                      label="State"
                      name="state"
                      options={STATES}
                      required
                      value={selectedState}
                      onChange={(v) => setSelectedState(v)}
                    />
                    <SelectField label="Role" name="role" options={roles} required />
                  </div>
                  {districts.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <SelectField
                        // Remount on state change so a stale district can't persist.
                        key={selectedState}
                        label="District"
                        name="district"
                        options={districts}
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="message"
                      className="font-mono text-[10px] uppercase tracking-widest text-ink/60 block mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us about your goals, challenges, or the programme you have in mind..."
                      className="w-full bg-paper border border-ink/20 px-4 py-3 text-ink placeholder:text-ink/30 focus:outline-none focus:border-clay transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-clay text-paper px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
                  >
                    Send Message →
                  </button>
                  <p className="text-[11px] text-ink/50 leading-relaxed">
                    By submitting, you agree to be contacted by NYtrc regarding your enquiry. We do
                    not share your data with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-mono text-[10px] uppercase tracking-widest text-ink/60 block mb-2"
      >
        {label}
        {required && <span className="text-clay ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-paper border border-ink/20 px-4 py-3 text-ink placeholder:text-ink/30 focus:outline-none focus:border-clay transition-colors"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const controlled = value !== undefined;
  return (
    <div>
      <label
        htmlFor={name}
        className="font-mono text-[10px] uppercase tracking-widest text-ink/60 block mb-2"
      >
        {label}
        {required && <span className="text-clay ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        {...(controlled
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: "" })}
        className="w-full bg-paper border border-ink/20 px-4 py-3 text-ink focus:outline-none focus:border-clay transition-colors appearance-none"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
