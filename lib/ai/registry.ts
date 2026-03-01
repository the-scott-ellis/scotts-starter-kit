import { createProviderRegistry } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

/**
 * Provider registry — swap models by changing a string.
 *
 * Usage:
 *   import { registry } from "@/lib/ai/registry";
 *   streamText({ model: registry.languageModel("anthropic:claude-sonnet-4-20250514"), ... })
 *   streamText({ model: registry.languageModel("openai:gpt-4o"), ... })
 */
export const registry = createProviderRegistry({ anthropic, openai });

/** Default model — change this one string to switch the whole app */
export const DEFAULT_MODEL = "anthropic:claude-sonnet-4-20250514" as const;
