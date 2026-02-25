import Link from "next/link";

const OTHER_PRODUCTS = [
  { name: "RiskScope", href: "https://riskscope.actvli.com", desc: "Scam risk index" },
  { name: "BillShrinkr", href: "https://billshrinkr.actvli.com", desc: "Subscription ROI tracker" },
  { name: "Vault", href: "https://actvlivault.lemonsqueezy.com/", desc: "Compliance templates" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0720] text-indigo-500 text-xs px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="text-white font-semibold mb-1 flex items-center gap-2">
              🪄 Incant
            </p>
            <p className="text-indigo-400 text-xs leading-relaxed mb-2">
              An{" "}
              <a
                href="https://www.actvli.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f5c518] hover:underline font-medium"
              >
                Äctvli Responsible Consulting
              </a>{" "}
              product.
            </p>
            <p className="text-indigo-600 text-xs">Cast your idea into an app.</p>
          </div>

          {/* Links */}
          <div>
            <p className="text-indigo-400 font-semibold mb-2 uppercase tracking-wider text-xs">Product</p>
            <div className="space-y-1.5">
              <Link href="/cast" className="block hover:text-indigo-300 transition-colors">Cast a spell</Link>
              <Link href="/explore" className="block hover:text-indigo-300 transition-colors">Explore</Link>
              <Link href="/pricing" className="block hover:text-indigo-300 transition-colors">Pricing</Link>
              <Link href="/dashboard" className="block hover:text-indigo-300 transition-colors">My Spellbook</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-indigo-400 font-semibold mb-2 uppercase tracking-wider text-xs">Legal</p>
            <div className="space-y-1.5">
              <Link href="/privacy" className="block hover:text-indigo-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-indigo-300 transition-colors">Terms of Service</Link>
              <a href="mailto:reachout@actvli.com" className="block hover:text-indigo-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>

        {/* Other products */}
        <div className="border-t border-white/5 pt-6 mb-6">
          <p className="text-indigo-400 text-xs mb-3">
            Check out our other products →{" "}
            <a
              href="https://www.actvli.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              actvli.com
            </a>
          </p>
          <div className="flex flex-wrap gap-3">
            {OTHER_PRODUCTS.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-indigo-300 transition-all"
              >
                <span className="text-indigo-300 font-medium">{p.name}</span>
                <span className="text-indigo-600">· {p.desc}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p>© {new Date().getFullYear()} Äctvli Responsible Consulting. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
