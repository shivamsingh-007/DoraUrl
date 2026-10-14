import { MegaMenuNavbar } from "@/components/ui/mega-menu-navbar";
import Image from "next/image";
import { Hero, Craft } from "@/components/Hero";
import { Method, Principles } from "@/components/Sections";
import { Faq, FinalCta, SiteFooter } from "@/components/Closing";
import StudioGate from "@/components/StudioGate";

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-col">
      <MegaMenuNavbar
        brandName="DoraDoraUrl"
        brandHref="#top"
        logo={
          <span className="relative block size-9 overflow-hidden rounded-full border-2 border-dora/20 bg-white">
            <Image src="/dora-icon.jpg" alt="DoraDoraUrl icon" width={36} height={36} className="h-full w-full object-cover" />
          </span>
        }
        pricingHref="#faq"
        loginHref="#craft"
        ctaHref="#studio"
        ctaLabel="Open the door"
      />
      <main className="flex-1">
        <Hero />
        <StudioGate />
        <Craft />
        <Method />
        <Principles />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
