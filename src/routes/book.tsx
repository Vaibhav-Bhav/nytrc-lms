import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { DISTRICTS_BY_STATE, STATES } from "@/lib/india-districts";
import { submitBooking } from "@/lib/booking";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Free Session — NYtrc" },
      {
        name: "description",
        content:
          "Book a free one-on-one session with the NYtrc team. Share your details and we'll get in touch to arrange a time that suits you.",
      },
      { property: "og:title", content: "Book a Free Session — NYtrc" },
      {
        property: "og:description",
        content: "Book a free one-on-one session with the NYtrc team.",
      },
      { property: "og:url", content: "/book" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

const languages = [
  "Hindi",
  "English",
  "Bhojpuri",
  "Maithili",
  "Magahi",
  "Bengali",
  "Odia",
  "Santali",
  "Urdu",
  "Rajasthani / Marwari",
  "Chhattisgarhi",
  "Other",
];

function BookPage() {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [selectedState, setSelectedState] = useState("");

  const districts = selectedState ? (DISTRICTS_BY_STATE[selectedState] ?? []) : [];
  const effectiveWhatsapp = sameAsMobile ? mobile : whatsapp;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);

    try {
      await submitBooking({
        data: {
          name: String(form.get("name") ?? "").trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          whatsapp: effectiveWhatsapp.trim(),
          whatsappSameAsMobile: sameAsMobile,
          state: selectedState,
          district: String(form.get("district") ?? ""),
          language: String(form.get("language") ?? ""),
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />

      {/* Hero */}
      <header className="pt-16 pb-16 px-6">
        <div className="max-w-5xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            Free Consultation
          </span>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
            Book Your Free <span className="italic text-clay">Session</span>.
          </h1>
        </div>
      </header>

      <section className="border-t border-ink/10 px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          {/* Left: what to expect */}
          <div className="lg:col-span-5 space-y-12">
            <p className="text-lg text-ink/80 leading-relaxed border-l-2 border-clay/30 pl-6">
              Share a few details and our team will reach out to arrange a one-on-one session at a
              time that suits you — no cost, no obligation.
            </p>

            <div className="border-t border-ink/10 pt-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-4">
                What to Expect
              </span>
              <ul className="space-y-4 text-ink/80">
                {[
                  "A conversation about your goals, in the language you prefer.",
                  "Guidance on CSC activation, VLE training, or investment structuring.",
                  "A clear set of next steps you can act on.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span className="text-clay font-bold shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-3">
                Prefer to Talk First?
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

          {/* Right: booking form */}
          <div className="lg:col-span-7">
            <div className="border border-ink/15 bg-paper-warm/30 p-8 md:p-12">
              <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-2">
                Request a Session
              </span>
              <h2 className="font-serif text-3xl mb-2">Book a free session</h2>
              <p className="text-sm text-ink/60 mb-10">
                All fields marked with <span className="text-clay">*</span> are required.
              </p>

              {submitted ? (
                <div className="border-2 border-clay/40 bg-paper p-10 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-clay font-bold block mb-3">
                    Request Received
                  </span>
                  <h3 className="font-serif text-2xl mb-3">Your session request is in.</h3>
                  <p className="text-ink/70 mb-6">
                    Our team will contact you on{" "}
                    <span className="text-ink font-semibold">{effectiveWhatsapp}</span> to confirm a
                    time.
                  </p>
                  <Link
                    to="/"
                    className="inline-block border border-ink/25 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-ink/5 transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Field
                    label="Full Name"
                    name="name"
                    placeholder="Rajesh Kumar"
                    autoComplete="name"
                    required
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={setEmail}
                  />
                  <Field
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    placeholder="+91 97795 35329"
                    autoComplete="tel"
                    pattern="[0-9+\s()-]{7,20}"
                    title="Enter a valid mobile number"
                    required
                    value={mobile}
                    onChange={setMobile}
                  />

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-3">
                      <input
                        type="checkbox"
                        checked={sameAsMobile}
                        onChange={(e) => setSameAsMobile(e.target.checked)}
                        className="w-4 h-4 accent-clay shrink-0"
                      />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                        WhatsApp number is the same as mobile
                      </span>
                    </label>
                    {!sameAsMobile && (
                      <Field
                        label="WhatsApp Number"
                        name="whatsapp"
                        type="tel"
                        placeholder="+91 97795 35329"
                        pattern="[0-9+\s()-]{7,20}"
                        title="Enter a valid WhatsApp number"
                        required
                        value={whatsapp}
                        onChange={setWhatsapp}
                      />
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <SelectField
                      label="State"
                      name="state"
                      options={STATES}
                      required
                      value={selectedState}
                      onChange={setSelectedState}
                    />
                    <SelectField
                      // Remount on state change so a stale district can't persist.
                      key={selectedState}
                      label="District"
                      name="district"
                      options={districts}
                      required
                      disabled={districts.length === 0}
                      placeholder={districts.length === 0 ? "Select a state first…" : "Select…"}
                    />
                  </div>

                  <SelectField
                    label="Preferred Language"
                    name="language"
                    options={languages}
                    required
                  />

                  {error && (
                    <p
                      role="alert"
                      className="border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-ink/80"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full bg-clay text-paper px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pending ? "Sending…" : "Book My Free Session →"}
                  </button>
                  <p className="text-[11px] text-ink/50 leading-relaxed">
                    By submitting, you agree to be contacted by NYtrc about this session. We do not
                    share your data with third parties.
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
  value,
  onChange,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "placeholder" | "required" | "value" | "onChange"
>) {
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
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        {...(controlled ? { value, onChange: (e) => onChange?.(e.target.value) } : {})}
        {...rest}
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
  disabled,
  placeholder = "Select…",
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
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
        disabled={disabled}
        {...(controlled
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: "" })}
        className="w-full bg-paper border border-ink/20 px-4 py-3 text-ink focus:outline-none focus:border-clay transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {placeholder}
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
