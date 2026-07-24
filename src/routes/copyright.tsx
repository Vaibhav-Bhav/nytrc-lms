import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/copyright")({
  head: () => ({
    meta: [
      { title: "Copyright Policy — NYtrc" },
      {
        name: "description",
        content:
          "Copyright and intellectual property terms for content published by NYtrc — including permitted use, attribution requirements, and takedown procedures.",
      },
      { property: "og:title", content: "Copyright Policy — NYtrc" },
      {
        property: "og:description",
        content:
          "Terms for reusing NYtrc website content, training material, and imagery.",
      },
      { property: "og:url", content: "/copyright" },
    ],
    links: [{ rel: "canonical", href: "/copyright" }],
  }),
  component: CopyrightPage,
});

function CopyrightPage() {
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
            Copyright <span className="italic text-clay">Policy</span>.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            © {year} NAVYUG Training and Research Consultants (NYTRC). All rights reserved.
          </p>
        </div>
      </header>

      <section className="border-t border-ink/10 px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10 text-ink/80 leading-relaxed">
          <Block title="1. Ownership">
            <p>
              All content on this website — including text, graphics, logos,
              icons, images, training curricula, videos, and downloadable
              material — is the property of NAVYUG Training and Research
              Consultants (NYTRC) or its licensors, and is protected under
              applicable Indian and international copyright laws.
            </p>
          </Block>

          <Block title="2. Permitted Use">
            <p>You may:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View, download, and print pages from this website for personal, non-commercial use.</li>
              <li>Quote short excerpts for research, journalism, or educational purposes with clear attribution to NYtrc and a link back to the source page.</li>
            </ul>
          </Block>

          <Block title="3. Prohibited Use">
            <p>Without prior written permission from NYtrc, you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reproduce, republish, or distribute our content for commercial purposes.</li>
              <li>Modify, translate, or create derivative works based on our training material.</li>
              <li>Use the NYtrc name, logo, or brand elements to imply endorsement or partnership.</li>
              <li>Scrape, mirror, or systematically extract content from this website.</li>
            </ul>
          </Block>

          <Block title="4. Third-Party Content">
            <p>
              Some images, data, and references on this website belong to third
              parties and are used with permission or under fair use. Rights to
              such content remain with their respective owners.
            </p>
          </Block>

          <Block title="5. Reporting Infringement">
            <p>
              If you believe content on this website infringes your copyright,
              please write to{" "}
              <a href="mailto:navyugconsultants2@gmail.com" className="text-clay underline">
                navyugconsultants2@gmail.com
              </a>{" "}
              with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A description of the copyrighted work and the allegedly infringing material.</li>
              <li>The URL or location of the material on our site.</li>
              <li>Your contact details and a statement of good-faith belief.</li>
              <li>A statement, under penalty of perjury, that the information is accurate and that you are authorised to act on the owner's behalf.</li>
            </ul>
          </Block>

          <Block title="6. Requesting Permission">
            <p>
              For permission to reuse NYtrc content — including presentations,
              case studies, or media — please contact us at the email above with
              details of intended use.
            </p>
          </Block>

          <Block title="7. Changes">
            <p>
              This policy may be updated periodically. The current version will
              always be available on this page.
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
