import { Footer } from "@/components/layout/footer";

// Public pages share the footer. Each page renders its own <Navbar>, because
// the home page overlays it on the hero and other pages do not.
// Customer and tradesperson dashboards will get their own route groups later.
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
