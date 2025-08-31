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
  title: "Odonto Center - Clínica Odontológica Premium",
  description:
    "Atendimento humanizado com excelência em odontologia. Agende sua consulta hoje mesmo.",
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
