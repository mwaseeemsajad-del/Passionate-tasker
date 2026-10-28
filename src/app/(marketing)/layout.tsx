import { Footer } from "@/components/layout/footer";
import { HelpAssistant } from "@/components/layout/help-assistant";

// Public pages share the footer and the help assistant in the corner. Each
// page renders its own <Navbar>, because the home page overlays it on the hero
// and other pages do not.
// Customer and tradesperson dashboards will get their own route groups later.
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <Footer />
      <HelpAssistant />
    </>
  );
}
