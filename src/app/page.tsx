import { Hero } from "@/components/home/hero";
import { Ecosystem } from "@/components/home/ecosystem";
import { Features } from "@/components/home/features";
import { SdkPreview } from "@/components/home/sdk-preview";
import { IntegrationsPreview } from "@/components/home/integrations-preview";
import { HomeCta } from "@/components/home/cta";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
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
