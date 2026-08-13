import { Link } from "@tanstack/react-router";
import nytrcLogo from "@/assets/nytrc-logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:justify-between">
        <Link to="/" className="flex items-center gap-3 min-w-0 shrink">
          <img
            src={nytrcLogo}
            alt="NYtrc logo"
            className="h-11 w-auto object-contain shrink-0"
          />
          <span className="font-sans text-2xl md:text-3xl font-extrabold tracking-tight text-ink truncate leading-none">
            NY<span className="text-clay">trc</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="text-xs font-semibold uppercase tracking-widest text-ink/60 hover:text-clay transition-colors pb-1 border-b-2 border-transparent data-[status=active]:text-clay data-[status=active]:border-clay"
            >
              {l.label}
            </Link>
          ))}

          {/* LMS entry point. The marketing site has no login; this is the one
              addition to the restored nav, per the combined-app design (G§2.1). */}
          <Link
            to="/login"
            className="text-xs font-bold uppercase tracking-widest bg-clay text-paper px-5 py-2.5 hover:bg-clay-deep transition-colors"
          >
            Login
          </Link>
        </div>

        <details className="md:hidden justify-self-end">
          <summary className="list-none cursor-pointer border border-ink/30 px-3 py-2 text-[10px] font-bold uppercase tracking-widest">
            Menu
          </summary>
          <div className="absolute left-0 right-0 top-20 bg-paper border-b border-ink/10 px-6 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="text-sm font-semibold uppercase tracking-widest text-ink/70 data-[status=active]:text-clay"
              >
                {l.label}
              </Link>
            ))}

            <Link
              to="/login"
              className="text-sm font-bold uppercase tracking-widest bg-clay text-paper px-5 py-3 text-center hover:bg-clay-deep transition-colors"
            >
              Login
            </Link>
          </div>
        </details>
      </div>
    </nav>
  );
}
