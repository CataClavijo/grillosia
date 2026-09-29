import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

import Script from "next/script";

import "./globals.css";
import { AsistenteFlotante } from "@/components/asistente-flotante";
import { SessionGate } from "@/components/session-gate";
import { TemaGuardado } from "@/components/theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { SubirConsultasLocales } from "@/components/subir-consultas-locales";
import { SwKillBoot } from "@/components/sw-kill-boot";
import { cn } from "@/lib/utils";

/**
 * Tres papeles, cada uno con su razon (linea editorial de campo, al modo de
 * la referencia que eligio Catalina):
 *
 *  - Barlow Condensed para titulares: condensada y firme, en mayusculas en
 *    los titulos de pagina y de seccion. Se lee de lejos y ocupa poco ancho
 *    en un celular.
 *  - IBM Plex Mono para rotulos, cifras pequenas y etiquetas ("Paso 3 de 4",
 *    "01"): el toque tecnico, de ficha de laboratorio.
 *  - Plus Jakarta Sans para todo el cuerpo. Para leer de corrido, este
 *    publico necesita una sans normal.
 */
const condensada = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
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
        condensada.variable,
        mono.variable,
      )}
    >
      <head>
        {/* Claro por defecto. Solo se pone oscuro si la persona lo eligio a
            mano: se ignora la preferencia del sistema a proposito, porque
            muchos celulares Android traen el modo oscuro activado de fabrica
            y la aplicacion se diseno en claro. Va con next/script antes de
            hidratar (un <script> suelto hace que React avise y a veces
            borre la clase al hidratar). */}
        <Script id="tema-inicial" strategy="beforeInteractive">
          {`(function(){try{if(localStorage.getItem("grillia-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <TemaGuardado />
        <SessionGate>
          <SwKillBoot />
          <SubirConsultasLocales />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <AsistenteFlotante />
        </SessionGate>
      </body>
    </html>
  );
}
