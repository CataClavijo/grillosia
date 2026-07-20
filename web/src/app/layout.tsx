import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { DemoBanner } from "@/components/demo-banner";
import { SiteFooter } from "@/components/site-footer";
import { SwKillBoot } from "@/components/sw-kill-boot";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrillIA — Inteligencia artificial para la cría de grillos",
  description:
    "Proyecto de inteligencia artificial que apoya la producción de harina de grillo como alternativa a la harina de pescado importada. Convocatoria Minciencias 963 de 2025, Universidad de los Llanos.",
  applicationName: "GrillIA",
  manifest: "/manifest.json",
  authors: [{ name: "Universidad de los Llanos" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GrillIA",
  },
  openGraph: {
    title: "GrillIA",
    description:
      "Inteligencia artificial para la cría de grillos. Proyecto Minciencias y Universidad de los Llanos.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F1E7" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1612" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", jakarta.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("grillia-theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SwKillBoot />
        <DemoBanner />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
