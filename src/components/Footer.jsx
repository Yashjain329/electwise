import { Link } from 'react-router-dom';
import { Vote, ExternalLink, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0d1b35] text-white/70 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-xl font-serif mb-3">
              <Vote size={22} className="text-[#fc8b19]" />
              Elect<span className="text-[#fc8b19]">Wise</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering every citizen with the knowledge to participate in India's democratic process.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="GitHub" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"><ExternalLink size={16}/></a>
              <a href="#" aria-label="Website" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"><Globe size={16}/></a>
              <a href="#" aria-label="Contact" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"><Mail size={16}/></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/journey', 'Journey Map'], ['/chat', 'AI Assistant'], ['/timeline', 'Timeline'], ['/glossary', 'Glossary & Quiz']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Info</h4>
            <ul className="space-y-2 text-sm">
              {[['#', 'About'], ['#', 'Privacy Policy'], ['#', 'Terms of Service'], ['#', 'Contact']].map(([href, label]) => (
                <li key={label}><a href={href} className="hover:text-white transition">{label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
          <span>© 2026 ElectWise. Empowering informed civic participation.</span>
          <span className="text-[#fc8b19]">Built for Hack2Skill PromptWars Hackathon</span>
        </div>
      </div>
    </footer>
  );
}
