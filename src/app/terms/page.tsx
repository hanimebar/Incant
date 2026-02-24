import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Incant",
  description: "Terms and conditions for using Incant.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0f0a2e] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-8 inline-block">← Back to Incant</Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-indigo-400 text-sm mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-indigo-200 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance</h2>
            <p>By creating an account or using Incant (&ldquo;the Service&rdquo;), you agree to these Terms. The Service is operated by Äctvli Responsible Consulting (&ldquo;we&rdquo;, &ldquo;us&rdquo;). If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. The Service</h2>
            <p>Incant is a platform that allows users to create personal micro-applications (&ldquo;spells&rdquo;) using AI-assisted generation from voice or text input. Spells are hosted at shareable URLs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Eligibility</h2>
            <p>You must be at least 16 years old to use Incant. By using the Service, you confirm you meet this requirement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Your account</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You must provide a valid email address.</li>
              <li>One account per person. You may not share or transfer your account.</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable use</h2>
            <p className="mb-2">You must not use Incant to create spells that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violate any applicable law or regulation.</li>
              <li>Infringe any third-party intellectual property rights.</li>
              <li>Collect personal data from others without consent.</li>
              <li>Are designed to deceive, defraud, or harm others.</li>
              <li>Contain malware, phishing content, or malicious code.</li>
              <li>Violate Anthropic&rsquo;s <a href="https://www.anthropic.com/usage-policy" className="text-indigo-400 underline" target="_blank" rel="noopener noreferrer">usage policies</a>.</li>
            </ul>
            <p className="mt-3">We reserve the right to remove any spell and suspend any account that violates these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Content ownership</h2>
            <p>You retain ownership of the content you create in your spells. By making a spell public, you grant Incant a non-exclusive licence to display it on the platform (e.g. the Explore page). You can make any spell private or delete it at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. AI-generated content</h2>
            <p>Spell configurations are generated using Anthropic&rsquo;s Claude AI. We do not guarantee the accuracy, completeness, or suitability of AI-generated content. You are responsible for reviewing and using your spells appropriately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Subscription &amp; billing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Paid plans (Caster, Wizard) are billed monthly via Stripe.</li>
              <li>Subscriptions renew automatically. Cancel anytime from your account settings or via <a href="mailto:reachout@actvli.com" className="text-indigo-400 underline">reachout@actvli.com</a>.</li>
              <li>No refunds for partial months, except where required by law.</li>
              <li>If your payment fails, access to paid features will be suspended until payment is resolved.</li>
              <li>We reserve the right to change pricing with 30 days&rsquo; notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Free plan limits</h2>
            <p>Free accounts are limited to 2 spells. Spells on free accounts display Incant branding on shared links. We reserve the right to modify free plan limits with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Service availability</h2>
            <p>We aim for high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience outages. We are not liable for losses arising from service unavailability.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Äctvli Responsible Consulting shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Termination</h2>
            <p>You may delete your account at any time from the dashboard. We may suspend or terminate accounts that violate these Terms. On termination, your spells become inaccessible. Data deletion follows the schedule in our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Governing law</h2>
            <p>These Terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the Irish courts, except where mandatory consumer protection laws in your country of residence apply.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Contact</h2>
            <p>Questions about these Terms: <a href="mailto:reachout@actvli.com" className="text-indigo-400 underline">reachout@actvli.com</a></p>
          </section>

        </div>
      </div>
    </main>
  );
}
