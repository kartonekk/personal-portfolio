import type { Metadata } from "next";
import { Archivo, Karla, Space_Mono } from "next/font/google";
import { site } from "../content/site";
import { siteUrl } from "../lib/links";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: "900",
  variable: "--font-display",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${site.name} - ${site.seo.jobTitle}`,
  description: site.subhead,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} - ${site.seo.jobTitle}`,
    description: site.subhead,
    images: [site.avatarUrl],
  },
  twitter: {
    card: "summary",
    title: `${site.name} - ${site.seo.jobTitle}`,
    description: site.subhead,
    images: [site.avatarUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${karla.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
