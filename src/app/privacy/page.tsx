import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Incant",
  description: "How Incant collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0f0a2e] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-8 inline-block">← Back to Incant</Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-indigo-400 text-sm mb-10">Last updated: February 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-indigo-200 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Who we are</h2>
            <p>Incant is a product of <a href="https://www.actvli.com" className="text-indigo-400 underline" target="_blank" rel="noopener noreferrer">Äctvli Responsible Consulting</a> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). We are the data controller for personal data processed through incant.actvli.com.</p>
            <p className="mt-2">Contact: <a href="mailto:reachout@actvli.com" className="text-indigo-400 underline">reachout@actvli.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. What data we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Account data:</strong> Your email address, used solely for authentication via magic link. We do not store passwords.</li>
              <li><strong className="text-white">App content:</strong> The apps (&ldquo;spells&rdquo;) you create — their names, configurations, and data you enter while using them.</li>
              <li><strong className="text-white">Usage data:</strong> View counts on public spells. We do not use cookies for tracking or analytics.</li>
              <li><strong className="text-white">Payment data:</strong> Billing is handled entirely by Stripe. We store only your Stripe customer ID and subscription status — never your card details.</li>
              <li><strong className="text-white">Voice input:</strong> If you use voice input, audio is processed entirely in your browser via the Web Speech API. We never receive or store your audio.</li>
              <li><strong className="text-white">App input text:</strong> The text description you type or speak is sent to Anthropic&rsquo;s Claude API to generate your app. See section 5 for details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Legal basis for processing (GDPR)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Contract performance:</strong> Processing your email and app data to provide the Incant service.</li>
              <li><strong className="text-white">Legitimate interests:</strong> View counts on public spells to show popularity.</li>
              <li><strong className="text-white">Legal obligation:</strong> Retaining billing records as required by applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
            <p>Incant uses only <strong className="text-white">strictly necessary cookies</strong> — specifically, a session cookie to keep you logged in. This cookie is essential for the service to function. No consent is required for strictly necessary cookies under GDPR.</p>
            <p className="mt-2">We do not use advertising cookies, analytics cookies, or any third-party tracking.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-party processors</h2>
            <p className="mb-3">We work with the following sub-processors, each bound by data processing agreements:</p>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white">Supabase (database &amp; auth)</p>
                <p className="text-sm text-indigo-300">Stores your account and app data. EU region. <a href="https://supabase.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white">Anthropic (Claude AI)</p>
                <p className="text-sm text-indigo-300">Receives your app description text to generate your app configuration. Anthropic does not use API inputs to train models. <a href="https://www.anthropic.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white">Stripe (payments)</p>
                <p className="text-sm text-indigo-300">Handles all payment processing. We never see your card details. <a href="https://stripe.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white">Vercel (hosting)</p>
                <p className="text-sm text-indigo-300">Hosts the application. May process request logs briefly. <a href="https://vercel.com/legal/privacy-policy" className="underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white">Resend (email)</p>
                <p className="text-sm text-indigo-300">Sends authentication magic links to your email. <a href="https://resend.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data retention</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your account and app data is retained for as long as your account is active.</li>
              <li>When you delete a spell, it is permanently removed from our database.</li>
              <li>When you delete your account, all personal data is deleted within 30 days, except billing records which are retained for 7 years as required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your rights under GDPR</h2>
            <p className="mb-3">If you are located in the EEA, UK, or Switzerland, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Access:</strong> Request a copy of your personal data.</li>
              <li><strong className="text-white">Rectification:</strong> Correct inaccurate data.</li>
              <li><strong className="text-white">Erasure:</strong> Delete your account and all associated data from your dashboard settings.</li>
              <li><strong className="text-white">Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong className="text-white">Restriction:</strong> Request we limit processing of your data.</li>
              <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests.</li>
            </ul>
            <p className="mt-3">To exercise any right, email <a href="mailto:reachout@actvli.com" className="text-indigo-400 underline">reachout@actvli.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with your local data protection authority.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. International transfers</h2>
            <p>Some of our processors (Anthropic, Stripe, Vercel) are based in the United States. Transfers are covered by Standard Contractual Clauses (SCCs) or equivalent mechanisms approved by the European Commission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children</h2>
            <p>Incant is not directed at children under 16. We do not knowingly collect data from children under 16. If you believe a child has provided us data, contact us at <a href="mailto:reachout@actvli.com" className="text-indigo-400 underline">reachout@actvli.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to this policy</h2>
            <p>We may update this policy. We will notify you by email for material changes. Continued use after notice constitutes acceptance.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
