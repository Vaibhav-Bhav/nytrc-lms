import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — NYtrc" },
      {
        name: "description",
        content:
          "Terms and Conditions governing access to NYtrc LMS — including enrolment, payments, content licensing, acceptable use, and governing law.",
      },
      { property: "og:title", content: "Terms & Conditions — NYtrc" },
      {
        property: "og:description",
        content:
          "Read the Terms and Conditions for using the NYtrc LMS training platform before purchasing a course.",
      },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <header className="pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            Policies
          </span>
          <h1 className="font-serif text-5xl md:text-6xl leading-[0.95] tracking-tight mb-6">
            Terms &amp; <span className="italic text-clay">Conditions</span>.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Last updated {year} · NAVYUG Training and Research Consultants (NYTRC)
          </p>
        </div>
      </header>

      <section className="border-t border-ink/10 px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10 text-ink/80 leading-relaxed">
          <Block title="1. Acceptance of Terms">
            <p>
              By accessing or purchasing a course on the NYtrc Learning Management
              System (LMS), you agree to be bound by these Terms and Conditions
              and all applicable laws and regulations. If you do not agree, please
              do not use the platform.
            </p>
          </Block>

          <Block title="2. About the Platform">
            <p>
              The NYtrc LMS is operated by NAVYUG Training and Research
              Consultants (NYTRC), a registered LLP with its principal office in
              Gurgaon, Haryana. The platform provides online training programmes
              in rural entrepreneurship, CSC operation, VLE development, and
              related areas.
            </p>
          </Block>

          <Block title="3. Eligibility">
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 18 years of age to create an account and purchase a course.</li>
              <li>You must provide accurate registration details, including a valid name, email address, and mobile number.</li>
              <li>Accounts are personal and non-transferable.</li>
            </ul>
          </Block>

          <Block title="4. Course Enrolment and Payment">
            <ul className="list-disc pl-6 space-y-2">
              <li>Course access is granted upon successful payment verification by our payment processor (Razorpay).</li>
              <li>All prices are listed inclusive of applicable GST. A statutory GST invoice will be generated and delivered on successful payment.</li>
              <li>NYTRC reserves the right to modify pricing at any time. Price changes do not affect previously completed purchases.</li>
              <li>You are responsible for selecting the correct course before payment.</li>
            </ul>
          </Block>

          <Block title="5. Course Access">
            <ul className="list-disc pl-6 space-y-2">
              <li>Upon successful enrolment, you receive lifetime access to the purchased course content, subject to these Terms.</li>
              <li>Course access is limited to a maximum of 2 active devices at any time.</li>
              <li>NYTRC reserves the right to update, modify, or retire course content to maintain quality and accuracy.</li>
              <li>
                Access may be suspended or revoked for violation of these Terms, including but not limited to
                sharing credentials, unauthorised distribution of content, or abusive conduct.
              </li>
            </ul>
          </Block>

          <Block title="6. Intellectual Property">
            <p>
              All course content — including videos, PDFs, quizzes, text, graphics,
              and other materials — is the exclusive intellectual property of NYTRC
              or its licensors. You are granted a limited, non-exclusive,
              non-transferable licence to access course content solely for your
              personal, non-commercial learning. You may not copy, redistribute,
              reproduce, sublicense, or commercially exploit any content without
              prior written consent from NYTRC.
            </p>
          </Block>

          <Block title="7. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Share your account credentials with any third party.</li>
              <li>Record, screenshot, or download course content for redistribution.</li>
              <li>Attempt to circumvent access controls, payment mechanisms, or platform security.</li>
              <li>Upload, transmit, or facilitate unlawful or harmful content through the platform.</li>
              <li>Use the platform in any manner that violates applicable laws.</li>
            </ul>
          </Block>

          <Block title="8. Refund Policy">
            <p>
              Refunds are governed separately by our{" "}
              <a href="/refund-policy" className="text-clay underline">
                Refund &amp; Cancellation Policy
              </a>
              , which forms part of these Terms and should be read alongside them.
            </p>
          </Block>

          <Block title="9. Disclaimer of Warranties">
            <p>
              The NYtrc LMS and its content are provided "as is" without warranties
              of any kind, express or implied. NYTRC does not guarantee that the
              platform will be uninterrupted, error-free, or completely secure.
              Course content is provided for educational purposes; outcomes depend
              on individual effort and circumstances.
            </p>
          </Block>

          <Block title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, NYTRC and its
              directors, employees, and partners shall not be liable for any
              indirect, incidental, consequential, or punitive damages arising from
              your use of the platform or its content.
            </p>
          </Block>

          <Block title="11. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws
              of India. Any disputes arising from or related to these Terms shall
              be subject to the exclusive jurisdiction of the courts in Gurgaon,
              Haryana.
            </p>
          </Block>

          <Block title="12. Modifications">
            <p>
              NYTRC reserves the right to modify these Terms at any time. Updated
              Terms will be published on this page. Continued use of the platform
              after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </Block>

          <Block title="13. Contact">
            <p>
              For any questions regarding these Terms, please write to{" "}
              <a href="mailto:navyugconsultants2@gmail.com" className="text-clay underline">
                navyugconsultants2@gmail.com
              </a>
              .
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
