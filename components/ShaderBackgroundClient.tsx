"use client";

import dynamic from "next/dynamic";

// WebGL canvas is client-only: no SSR, and avoids a flash of unstyled shader.
// The ssr:false dynamic import must live inside a Client Component boundary.
const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
});

export default function ShaderBackgroundClient() {
  return <Experience />;
}
