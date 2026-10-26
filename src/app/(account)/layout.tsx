import { Footer } from "@/components/layout/footer";

// Signed-in pages: the customer account and the tradesperson dashboard. The
// proxy sends signed-out visitors to /login before these render.
export default function AccountLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
