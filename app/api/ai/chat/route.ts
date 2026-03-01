import { auth } from "@clerk/nextjs/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { registry, DEFAULT_MODEL } from "@/lib/ai/registry";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: registry.languageModel(DEFAULT_MODEL),
    system:
      "You are a helpful assistant. Be concise and clear in your responses.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
