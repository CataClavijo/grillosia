import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Schibsted_Grotesk,
} from "next/font/google";

import "./globals.css";
import { SessionGate } from "@/components/session-gate";
import { SiteFooter } from "@/components/site-footer";
import { SubirConsultasLocales } from "@/components/subir-consultas-locales";
import { SwKillBoot } from "@/components/sw-kill-boot";
import { cn } from "@/lib/utils";

/**
 * Cuatro papeles, cada uno con su razon:
 *
 *  - Schibsted Grotesk para titulares: x-alta grande, se lee de lejos y en
 *    pantalla pequena.
 *  - Instrument Serif solo en la frase de enfasis del titular. Nunca en
 *    parrafos: para leer de corrido, este publico necesita la sans.
 *  - JetBrains Mono en microetiquetas ("PASO 3 DE 4"), a 11 px y no a 8,
 *    que es lo que la hace legible para ojos mayores.
 *  - Plus Jakarta Sans para todo el cuerpo. Ya estaba y funciona.
 */
const grotesk = Schibsted_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** Dominio público. Sin esto las vistas previas al compartir por WhatsApp no
 *  resuelven bien las rutas relativas. */
const SITIO = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grillosia.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: "GrillosIA — Inteligencia artificial para la cría de grillos",
  description:
    "Proyecto de inteligencia artificial que apoya la producción de harina de grillo como alternativa a la harina de pescado importada. Convocatoria Minciencias 963 de 2025, Universidad de los Llanos.",
  applicationName: "GrillosIA",
  manifest: "/manifest.json",
  authors: [{ name: "Universidad de los Llanos" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GrillosIA",
  },
  openGraph: {
    title: "GrillosIA",
    description:
      "Inteligencia artificial para la cría de grillos. Proyecto Minciencias y Universidad de los Llanos.",
    type: "website",
    locale: "es_CO",
    url: SITIO,
    siteName: "GrillosIA",
  },
};

export const viewport: Viewport = {
  // Un solo color: la aplicacion arranca en claro pase lo que pase, y la
  // barra del navegador tiene que ir a juego. Con dos valores atados a la
  // preferencia del sistema, un celular en modo oscuro mostraba barra negra
  // sobre pagina crema.
  themeColor: "#F4F1E7",
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
      className={cn(
        "h-full antialiased font-sans",
        jakarta.variable,
        grotesk.variable,
        serif.variable,
        mono.variable,
      )}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            // Claro por defecto. Solo se pone oscuro si la persona lo eligio a
            // mano: se ignora la preferencia del sistema a proposito, porque
            // muchos celulares Android traen el modo oscuro activado de
            // fabrica y la aplicacion se disenno en claro.
            __html: `(function(){try{if(localStorage.getItem("grillia-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionGate>
          <SwKillBoot />
          <SubirConsultasLocales />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </SessionGate>
      </body>
    </html>
  );
}
