import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/social-media")({
  head: () => ({
    meta: [
      { title: "Social Media Policy — NYtrc" },
      {
        name: "description",
        content:
          "Guidelines for engagement across NYtrc's official social media channels — expected conduct, moderation approach, and how we handle user-submitted content.",
      },
      { property: "og:title", content: "Social Media Policy — NYtrc" },
      {
        property: "og:description",
        content:
          "How NYtrc communicates on social platforms and what we ask of our community.",
      },
      { property: "og:url", content: "/social-media" },
    ],
    links: [{ rel: "canonical", href: "/social-media" }],
  }),
  component: SocialPage,
});

function SocialPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <header className="pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto animate-ink-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-harvest font-semibold block mb-6">
            Policies
          </span>
          <h1 className="font-serif text-5xl md:text-6xl leading-[0.95] tracking-tight mb-6">
            Social Media <span className="italic text-clay">Policy</span>.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Applies to all official NYtrc handles and community engagement.
          </p>
        </div>
      </header>

      <section className="border-t border-ink/10 px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10 text-ink/80 leading-relaxed">
          <Block title="1. Purpose">
            <p>
              NYtrc uses social media to share updates on rural entrepreneurship,
              VLE stories, training opportunities, and programme outcomes. Our
              intent is to inform, educate, and encourage participation.
            </p>
          </Block>

          <Block title="2. Official Channels">
            <p>
              Only handles listed on our website or authorised by NYtrc
              leadership are considered official. Content on unofficial handles
              does not represent NYtrc.
            </p>
          </Block>

          <Block title="3. Community Guidelines">
            <p>When engaging with our channels, please:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be respectful — no abusive, discriminatory, or hateful content.</li>
              <li>Avoid sharing personal contact details, Aadhaar numbers, PAN, or bank information in public comments.</li>
              <li>Do not post misleading claims about government schemes or CSC services.</li>
              <li>Do not use our platforms for spam, promotions, or solicitation.</li>
            </ul>
          </Block>

          <Block title="4. Moderation">
            <p>
              We reserve the right to hide, remove, or report content that
              violates these guidelines or the platform's own terms. Repeat
              violators may be blocked.
            </p>
          </Block>

          <Block title="5. User-Submitted Content">
            <p>
              By tagging or mentioning NYtrc, you grant us permission to reshare
              your content with attribution, unless you tell us otherwise. Please
              only share images and stories you have the right to share.
            </p>
          </Block>

          <Block title="6. Employee & Partner Conduct">
            <p>
              Team members, trainers, and programme partners represent NYtrc when
              posting publicly. They are expected to be accurate, respectful, and
              to clearly separate personal opinions from official positions.
            </p>
          </Block>

          <Block title="7. Response Times">
            <p>
              We aim to respond to direct messages and comments within two
              working days. For time-sensitive queries, please email{" "}
              <a href="mailto:navyugconsultants2@gmail.com" className="text-clay underline">
                navyugconsultants2@gmail.com
              </a>.
            </p>
          </Block>

          <Block title="8. Updates">
            <p>
              This policy may be revised. The current version will always be
              available on this page.
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
