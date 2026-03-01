"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { IconSend, IconPlayerStop, IconRobot, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <IconRobot className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">How can I help you?</p>
              <p className="text-sm text-muted-foreground">
                Ask me anything. Press Enter to send, Shift+Enter for a new line.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            // Extract text content from parts (AI SDK v6)
            const textContent = message.parts
              .filter((p) => p.type === "text")
              .map((p) => (p as { type: "text"; text: string }).text)
              .join("");

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                    <IconRobot className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {textContent}
                </div>
                {message.role === "user" && (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary mt-0.5">
                    <IconUser className="size-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Streaming indicator */}
        {status === "submitted" && (
          <div className="flex gap-3 justify-start">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
              <IconRobot className="size-4 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            className="min-h-[44px] max-h-32 resize-none flex-1"
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={stop}
              className="shrink-0"
            >
              <IconPlayerStop className="size-4" />
              <span className="sr-only">Stop</span>
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="shrink-0"
            >
              <IconSend className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
