export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
      </div>

      <Section title="1. Information We Collect">
        We collect information you provide directly to us, such as your name and
        email address when you create an account. We also collect usage data and
        technical information about your interactions with the service.
      </Section>

      <Section title="2. How We Use Your Information">
        We use the information we collect to provide, maintain, and improve the
        service, to process transactions, to send communications, and to comply
        with legal obligations.
      </Section>

      <Section title="3. Information Sharing">
        We do not sell your personal information. We may share information with
        third-party service providers who assist in operating our service,
        subject to confidentiality agreements.
      </Section>

      <Section title="4. Data Retention">
        We retain your information for as long as your account is active or as
        needed to provide services. You may request deletion of your data at any
        time by contacting us.
      </Section>

      <Section title="5. Security">
        We implement appropriate technical and organizational measures to protect
        your information against unauthorized access, alteration, disclosure, or
        destruction.
      </Section>

      <Section title="6. Cookies">
        We use cookies and similar tracking technologies to maintain your
        session and preferences. You can control cookies through your browser
        settings.
      </Section>

      <Section title="7. Your Rights">
        Depending on your location, you may have rights to access, correct,
        delete, or port your personal data. Contact us to exercise these rights.
      </Section>

      <Section title="8. Contact">
        If you have any questions about this Privacy Policy, please contact us.
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
