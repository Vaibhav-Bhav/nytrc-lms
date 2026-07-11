import { Link } from "@tanstack/react-router";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper/90 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <span className="font-serif text-2xl font-black text-clay block mb-6">
              GramUdyam
            </span>
            <p className="text-xs leading-relaxed text-paper/60 max-w-[36ch]">
              Activating rural enterprise across India's gram panchayats — through
              the CSC scheme, capacity building, and ground-level partnership.
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-widest text-harvest mb-6">
              Navigate
            </h5>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-clay transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-clay transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-clay transition-colors">Services</Link></li>
              <li><Link to="/contact" className="hover:text-clay transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-widest text-harvest mb-6">
              Services
            </h5>
            <ul className="space-y-3 text-sm">
              <li><Link to="/services" className="hover:text-clay transition-colors">CSC Revival</Link></li>
              <li><Link to="/services" className="hover:text-clay transition-colors">VLE Training</Link></li>
              <li><Link to="/services" className="hover:text-clay transition-colors">State Integration</Link></li>
              <li><Link to="/services" className="hover:text-clay transition-colors">Impact Advisory</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-widest text-harvest mb-6">
              Registered Office
            </h5>
            <address className="not-italic text-sm text-paper/60 leading-relaxed space-y-2">
              <p className="text-paper/80">NAVYUG Training and Research Consultants (NYTRC)</p>
              <p>Haryana, India</p>
              <p><a href="mailto:navyugconsultants2@gmail.com" className="hover:text-clay transition-colors">navyugconsultants2@gmail.com</a></p>
              <p><a href="tel:+919779535329" className="hover:text-clay transition-colors">+91 97795 35329</a></p>
            </address>
          </div>
        </div>

        <div className="pt-8 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-paper/40 uppercase tracking-widest text-center md:text-left">
            &copy; {year} GramUdyam — a public initiative of NYTRC. All rights reserved.
          </p>
          <p className="text-[10px] font-mono text-paper/40 uppercase tracking-widest text-center md:text-right">
            MSME Registered · CIN pending publication
          </p>
        </div>
      </div>
    </footer>
  );
}
