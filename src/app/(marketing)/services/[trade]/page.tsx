import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { getService, services } from "@/data/services";
import { OtherServices, ServiceChecks, ServiceHero, ServiceJobs, ServiceSteps } from "@/features/services";

// One page per trade, built at build time from src/data/services.ts. Any other slug is a 404.
export function generateStaticParams() {
  return services.map((s) => ({ trade: s.slug }));
}

// Every trade is prerendered from generateStaticParams, so reading params here blocks nothing.
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/services/[trade]">): Promise<Metadata> {
  const service = getService((await params).trade);
  if (!service) return {};
  return {
    title: `${service.name}: book ${service.person}`,
    description: `${service.summary} Every tradesperson is checked. Book by voice, online or by phone.`,
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[trade]">) {
  const service = getService((await params).trade);
  if (!service) notFound();
  return (
    <>
      <Navbar variant="solid" />
      <main id="main" tabIndex={-1} className="outline-none">
        <ServiceHero service={service} />
        <ServiceJobs service={service} />
        <ServiceSteps service={service} />
        <ServiceChecks service={service} />
        <OtherServices current={service.slug} />
      </main>
    </>
  );
}
