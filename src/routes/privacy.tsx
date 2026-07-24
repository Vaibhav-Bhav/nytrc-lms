import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — NYtrc" },
      {
        name: "description",
        content:
          "How NYtrc (NAVYUG Training and Research Consultants) collects, uses, and safeguards personal information across its website, training programmes, and rural entrepreneurship services.",
      },
      { property: "og:title", content: "Privacy Policy — NYtrc" },
      {
        property: "og:description",
        content:
          "This page explains how NYtrc handles personal information collected through our website and services.",
      },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <header className="pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            Policies
          </span>
          <h1 className="font-serif text-5xl md:text-6xl leading-[0.95] tracking-tight mb-6">
            Privacy <span className="italic text-clay">Policy</span>.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            This page is maintained by NYtrc and describes our current practices.
          </p>
        </div>
      </header>

      <section className="border-t border-ink/10 px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10 text-ink/80 leading-relaxed">
          <Block title="1. Who We Are">
            <p>
              NAVYUG Training and Research Consultants (NYTRC), publicly operating
              under the NYtrc brand, is a registered LLP with its registered office
              in Gurgaon, Haryana. We provide rural entrepreneurship development,
              CSC activation and revival, VLE training, and impact advisory
              services.
            </p>
          </Block>

          <Block title="2. Information We Collect">
            <p>We may collect the following categories of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, phone number, and other contact details.</li>
              <li>State, district, and role (aspiring VLE, existing operator, investor, etc.) submitted through our enquiry forms.</li>
              <li>Communications you send us, including messages, feedback, or programme applications.</li>
              <li>Basic technical information such as IP address, browser type, and pages visited, collected through standard web logs.</li>
            </ul>
          </Block>

          <Block title="3. How We Use Your Information">
            <ul className="list-disc pl-6 space-y-2">
              <li>To respond to enquiries and provide requested information.</li>
              <li>To deliver training programmes, mentorship, and CSC-related support.</li>
              <li>To improve our services, website, and outreach.</li>
              <li>To comply with applicable laws and regulatory obligations.</li>
            </ul>
          </Block>

          <Block title="4. Sharing of Information">
            <p>
              We do not sell your personal information. We may share limited data
              with government agencies, banking or insurance partners, and
              authorised programme collaborators only where necessary to deliver
              services you have requested, or as required by law.
            </p>
          </Block>

          <Block title="5. Data Security">
            <p>
              We follow reasonable technical and organisational measures to protect
              personal information against unauthorised access, disclosure, or
              loss. No system is fully immune to risk; we continuously review our
              practices.
            </p>
          </Block>

          <Block title="6. Your Choices">
            <p>
              You may request access to, correction of, or deletion of your
              personal information held by us by writing to{" "}
              <a href="mailto:navyugconsultants2@gmail.com" className="text-clay underline">
                navyugconsultants2@gmail.com
              </a>
              . We will respond within a reasonable timeframe.
            </p>
          </Block>

          <Block title="7. Cookies">
            <p>
              Our website may use essential cookies and basic analytics to
              understand aggregate usage. You can control cookies through your
              browser settings.
            </p>
          </Block>

          <Block title="8. Changes to this Policy">
            <p>
              We may update this policy from time to time. The latest version will
              always be available on this page.
            </p>
          </Block>

          <Block title="9. Contact">
            <p>
              Questions about privacy can be sent to{" "}
              <a href="mailto:navyugconsultants2@gmail.com" className="text-clay underline">
                navyugconsultants2@gmail.com
              </a>.
            </p>
          </Block>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
