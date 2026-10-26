"use client";

import { useEffect } from "react";
import { Button, Container, Eyebrow } from "@/components/ui";
import { site } from "@/data/site";

/*
 * Shown when a page fails to load. Plain words, a way to try again, and the
 * phone number, so nobody is stuck. The error goes to the server logs
 * (Vercel) through console.error.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Container className="grid max-w-[720px] gap-6 py-20">
        <Eyebrow>Something went wrong</Eyebrow>
        <h1 className="text-display">Sorry, this page did not load</h1>
        <p className="text-text-2">
          Please try again. If it keeps happening, call us on{" "}
          <a href={site.phone.href} className="font-semibold underline underline-offset-4">
            {site.phone.display}
          </a>
          , {site.supportHours}, and we will book your job for you.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="outline">
            Go to the home page
          </Button>
        </div>
      </Container>
    </main>
  );
}
