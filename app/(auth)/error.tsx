"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Authentication error</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Something went wrong during sign in."}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} size="sm" variant="outline">
          Try again
        </Button>
        <Button asChild size="sm">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
