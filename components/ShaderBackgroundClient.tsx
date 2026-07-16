"use client";

import dynamic from "next/dynamic";

// WebGL canvas is client-only: no SSR, and avoids a flash of unstyled shader.
// The ssr:false dynamic import must live inside a Client Component boundary.
const ShaderBackground = dynamic(() => import("@/components/ShaderBackground"), {
  ssr: false,
});

export default function ShaderBackgroundClient() {
  return <ShaderBackground />;
}
