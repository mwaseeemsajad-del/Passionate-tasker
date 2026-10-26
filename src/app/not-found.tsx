import { Button, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center">
      <Container className="grid justify-items-center gap-5 text-center">
        <p className="text-text-3">Error 404</p>
        <h1 className="text-h2">We couldn’t find that page</h1>
        <p className="max-w-[46ch] text-text-3">The link may be old, or the page may have moved. Start again from the home page.</p>
        <Button href="/">Go to the home page</Button>
      </Container>
    </main>
  );
}
