import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { PRICE_NOTE, services } from "@/data/services";
import { site } from "@/data/site";
import { InfoPage, InfoSection, PointList, Prose } from "@/features/info/info-page";
import { TradePriceTable } from "@/features/pricing/components/trade-price-table";

export const metadata: Metadata = {
  title: "Prices",
  description: "Starting prices for every job we do, and how the final price is agreed with you before anything is booked.",
};

export default function PricingPage() {
  return (
    <InfoPage
      eyebrow="Prices"
      title="What jobs cost"
      lede="Starting prices for every job we do. The full price is agreed with you on the phone before anything is booked, so there are no surprises on the day."
    >
      <InfoSection id="how-prices-work" title="How prices work">
        <PointList
          items={[
            { title: "Starting prices", body: <p>{PRICE_NOTE}</p> },
            { title: "Agreed before anything is booked", body: <p>When we call to confirm, we go through the job with you and agree the price. You can say no, and nothing is booked.</p> },
            { title: "Extra work needs your yes", body: <p>If the tradesperson finds more to do, nothing extra is done or charged until you agree the new price.</p> },
            { title: "Pay when it is done", body: <p>Nothing is paid online and nothing is taken when you book. We tell you how to pay when we call.</p> },
            {
              title: "Not on the list?",
              body: (
                <p>
                  Choose “Something else” when you book and describe the job, or call us on <a href={site.phone.href}>{site.phone.display}</a>. We
                  price it after a quick call.
                </p>
              ),
            },
          ]}
        />
      </InfoSection>

      <div className="grid gap-12">
        {services.map((service) => (
          <TradePriceTable key={service.slug} service={service} />
        ))}
      </div>

      <InfoSection id="plans" title="Plans for regular customers and landlords">
        <Prose>
          <p>
            We are planning yearly plans, for example for an annual boiler service or landlord gas certificates. They are not available yet. Until
            they are, every job is booked and priced on its own.
          </p>
        </Prose>
      </InfoSection>

      <InfoSection id="book" title="Ready to book?">
        <div className="flex flex-wrap gap-3">
          <Button href="/book">Book a job</Button>
          <Button href="/book?voice=1" variant="outline">
            Book by voice
          </Button>
        </div>
      </InfoSection>
    </InfoPage>
  );
}
