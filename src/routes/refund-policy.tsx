import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy — NYtrc" },
      {
        name: "description",
        content:
          "NYtrc Refund and Cancellation Policy — conditions under which a course refund may be requested, timelines, and the process for applying.",
      },
      { property: "og:title", content: "Refund & Cancellation Policy — NYtrc" },
      {
        property: "og:description",
        content:
          "Learn about the NYtrc refund and cancellation policy before purchasing a course.",
      },
      { property: "og:url", content: "/refund-policy" },
    ],
    links: [{ rel: "canonical", href: "/refund-policy" }],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
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
            Refund &amp; <span className="italic text-clay">Cancellation</span>.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Last updated {year} · NAVYUG Training and Research Consultants (NYTRC)
          </p>
        </div>
      </header>

      <section className="border-t border-ink/10 px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10 text-ink/80 leading-relaxed">
          <Block title="1. Overview">
            <p>
              NAVYUG Training and Research Consultants (NYTRC) is committed to
              providing high-quality educational programmes. We understand that
              circumstances can change, and we have a transparent policy for
              handling refund and cancellation requests.
            </p>
          </Block>

          <Block title="2. Refund Eligibility">
            <p>A refund may be requested under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Within 7 days of purchase</strong> — If you have not
                accessed more than 20% of the course content (as recorded in our
                system), you are eligible for a full refund.
              </li>
              <li>
                <strong>Technical issues</strong> — If a documented and
                unrectified technical failure on our platform prevents access to
                course content for more than 7 consecutive days after a support
                ticket has been raised, a full refund will be issued.
              </li>
              <li>
                <strong>Duplicate payment</strong> — If you are charged more than
                once for the same course due to a payment processor error, the
                duplicate charge will be fully refunded.
              </li>
            </ul>
          </Block>

          <Block title="3. Non-Refundable Circumstances">
            <p>Refunds will not be issued in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refund request submitted more than 7 days after the purchase date.</li>
              <li>More than 20% of course content has been accessed or completed.</li>
              <li>Violation of the{" "}
                <a href="/terms" className="text-clay underline">Terms &amp; Conditions</a>
                , including account sharing or unauthorised content distribution.
              </li>
              <li>Change of mind after substantial course engagement.</li>
              <li>Dissatisfaction with course content that does not constitute a technical failure.</li>
              <li>Requests submitted after account suspension or revocation due to policy violations.</li>
            </ul>
          </Block>

          <Block title="4. How to Request a Refund">
            <p>
              To initiate a refund, please send a written request to{" "}
              <a href="mailto:navyugconsultants2@gmail.com" className="text-clay underline">
                navyugconsultants2@gmail.com
              </a>{" "}
              with the following details:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full name and registered email address.</li>
              <li>Course name and date of purchase.</li>
              <li>Razorpay order or payment ID (available in your confirmation email).</li>
              <li>Reason for refund request.</li>
            </ul>
          </Block>

          <Block title="5. Processing Timeline">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Refund requests are reviewed within <strong>3–5 business days</strong> of receipt.
              </li>
              <li>
                Approved refunds are processed to the original payment method within
                <strong> 7–10 business days</strong> thereafter, subject to your bank or payment
                provider's processing time.
              </li>
              <li>
                GST charged on the original transaction may not be refundable
                depending on applicable statutory requirements.
              </li>
            </ul>
          </Block>

          <Block title="6. Cancellation">
            <p>
              As course access is provided immediately upon successful payment, there
              is no separate cancellation window distinct from the refund policy
              described above. If you no longer wish to access your purchased course,
              please contact us at the email above.
            </p>
          </Block>

          <Block title="7. Contact">
            <p>
              For refund requests or related queries, please write to{" "}
              <a href="mailto:navyugconsultants2@gmail.com" className="text-clay underline">
                navyugconsultants2@gmail.com
              </a>
              . We aim to respond within 2 business days.
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
