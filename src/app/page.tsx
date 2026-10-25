import { Hero } from "@/components/home/hero";
import { Ecosystem } from "@/components/home/ecosystem";
import { Features } from "@/components/home/features";
import { SdkPreview } from "@/components/home/sdk-preview";
import { IntegrationsPreview } from "@/components/home/integrations-preview";
import { HomeCta } from "@/components/home/cta";
import { Footer } from "@/components/layout/footer";
import { KrezkaHome } from "@/components/home/krezka-home";
import { esKrezka } from "@/config/brand";

export default function HomePage() {
  if (esKrezka) {
    return (
      <>
        <KrezkaHome />
        <Footer />
      </>
    );
  }
  return (
    <>
      <Hero />
      <Ecosystem />
      <Features />
      <SdkPreview />
      <IntegrationsPreview />
      <HomeCta />
      <Footer />
    </>
  );
}
