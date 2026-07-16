import SmoothScroll from "@/components/SmoothScroll";
import ShaderBackgroundClient from "@/components/ShaderBackgroundClient";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Work from "@/components/Work";
import Engine from "@/components/Engine";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <ShaderBackgroundClient />
      <main className="relative z-10">
        <Hero />
        <Manifesto />
        <Work />
        <Engine />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
