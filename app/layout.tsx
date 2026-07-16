import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanvi — Cinematic AI Production",
  description:
    "Sanvi is an AI-driven cinematic production studio — sci-fi shorts, character-driven films, and the shader-built worlds that stage them.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,400&family=Space+Mono:wght@400;700&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
