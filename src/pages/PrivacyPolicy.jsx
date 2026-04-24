export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-sm text-foreground">
      <h1 className="text-2xl font-heading font-black mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: April 11, 2026</p>

      <section className="mb-6">
        <h2 className="font-bold text-base mb-2">1. Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed">When you sign in with Google, we receive your email address and display name. We store this to track your learning progress, XP, and streaks. Econ-Go is free — we do not collect payment details.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base mb-2">2. How We Use Your Information</h2>
        <p className="text-muted-foreground leading-relaxed">Your email is used to identify your account and save your progress across devices. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base mb-2">3. Data Storage</h2>
        <p className="text-muted-foreground leading-relaxed">Your account data (email, XP, streak, avatar) is stored securely in Supabase. Your learning progress and preferences are stored locally in your browser. We use Google OAuth for authentication — we never see or store your Google password.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base mb-2">4. AI Features</h2>
        <p className="text-muted-foreground leading-relaxed">Typed quiz answers may be sent to Google Gemini for AI grading. These answers are not stored after grading and are not used to train AI models.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base mb-2">5. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">We use browser localStorage to save your session and preferences. We do not use third-party tracking cookies or advertising cookies.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base mb-2">6. Children's Privacy</h2>
        <p className="text-muted-foreground leading-relaxed">Econ-Go is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-base mb-2">7. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">Questions about this policy? Email us at <a href="mailto:donaldliang45@gmail.com" className="text-primary underline">donaldliang45@gmail.com</a>.</p>
      </section>
    </div>
  );
}
