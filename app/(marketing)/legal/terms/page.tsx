export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
      </div>

      <Section title="1. Acceptance of Terms">
        By accessing or using this service, you agree to be bound by these Terms
        of Service. If you do not agree, do not use the service.
      </Section>

      <Section title="2. Use of Service">
        You may use this service only for lawful purposes and in accordance with
        these Terms. You agree not to use the service in any way that violates
        applicable laws or regulations.
      </Section>

      <Section title="3. Accounts and Organizations">
        You are responsible for maintaining the security of your account and
        organization. You must notify us immediately of any unauthorized use of
        your account.
      </Section>

      <Section title="4. Intellectual Property">
        The service and its original content, features, and functionality are
        owned by us and are protected by international copyright, trademark,
        patent, trade secret, and other intellectual property laws.
      </Section>

      <Section title="5. Limitation of Liability">
        To the fullest extent permitted by law, we shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages
        resulting from your use of the service.
      </Section>

      <Section title="6. Termination">
        We may terminate or suspend your access to the service immediately,
        without prior notice, for conduct that we believe violates these Terms
        or is harmful to other users, us, or third parties.
      </Section>

      <Section title="7. Changes to Terms">
        We reserve the right to modify these terms at any time. We will provide
        notice of significant changes by updating the date at the top of this
        page.
      </Section>

      <Section title="8. Contact">
        If you have any questions about these Terms, please contact us.
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
