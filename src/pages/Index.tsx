import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { WhoWeServeSection } from "@/components/home/WhoWeServeSection";
import { WhyTherizoSection } from "@/components/home/WhyTherizoSection";
import { FeaturedPropertiesSection } from "@/components/home/FeaturedPropertiesSection";
import { ElitePropertyCarousel } from "@/components/home/ElitePropertyCarousel";
import { ROITeaserSection } from "@/components/home/ROITeaserSection";
import { OurStandardSection } from "@/components/home/OurStandardSection";
import { TeamPreviewSection } from "@/components/home/TeamPreviewSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <WhoWeServeSection />
      <WhyTherizoSection />
      <ElitePropertyCarousel />
      <FeaturedPropertiesSection />
      <ROITeaserSection />
      <OurStandardSection />
      <TeamPreviewSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
