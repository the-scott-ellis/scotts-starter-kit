import { Protect } from "@clerk/nextjs";
import { ChatInterface } from "@/components/ai/chat-interface";
import { PageHeader } from "@/components/shared/page-header";
import CustomClerkPricing from "@/components/custom-clerk-pricing";

function UpgradePrompt() {
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="text-2xl font-semibold">AI Chat requires a paid plan</h2>
        <p className="text-muted-foreground">
          Upgrade your organization to access the AI assistant.
        </p>
      </div>
      <CustomClerkPricing forOrganizations />
    </div>
  );
}

export default function AiPage() {
  return (
    <>
      <PageHeader
        title="AI Chat"
        description="Ask questions, get help, or explore ideas with AI."
      />
      <Protect
        condition={(has) =>
          has({ feature: "ai-chat" }) ||
          has({ plan: "pro" }) ||
          has({ plan: "enterprise" })
        }
        fallback={<UpgradePrompt />}
      >
        <div className="px-4 lg:px-6">
          <ChatInterface />
        </div>
      </Protect>
    </>
  );
}
