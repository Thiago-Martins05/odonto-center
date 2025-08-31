import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/navigation";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Odonto Center - Clínica Odontológica Premium | Agendamento Online",
  description:
    "Clínica odontológica de excelência com atendimento humanizado e biossegurança rigorosa. Agende sua consulta online para avaliação, limpeza, tratamento de canal e mais. Atendimento em São Paulo.",
  keywords: [
    "odontologia",
    "clínica odontológica",
    "dentista",
    "agendamento online",
    "consulta odontológica",
    "limpeza dental",
    "tratamento de canal",
    "São Paulo",
    "biossegurança",
    "atendimento humanizado"
  ],
  authors: [{ name: "Odonto Center" }],
  creator: "Odonto Center",
  publisher: "Odonto Center",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://odontocenter.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://odontocenter.com",
    title: "Odonto Center - Clínica Odontológica Premium",
    description: "Clínica odontológica de excelência com atendimento humanizado e biossegurança rigorosa. Agende sua consulta online.",
    siteName: "Odonto Center",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Odonto Center - Clínica Odontológica Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Odonto Center - Clínica Odontológica Premium",
    description: "Clínica odontológica de excelência com atendimento humanizado e biossegurança rigorosa.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSerif.variable} ${plusJakarta.variable}`}
    >
      <body className={`${plusJakarta.className} antialiased`}>
        <Providers>
          <Navigation />
          <div className="min-h-screen bg-light-bg">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
