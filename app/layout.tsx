import type { Metadata } from "next";
import { Archivo, Karla, Space_Mono } from "next/font/google";
import { site } from "../content/site";
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
  title: `${site.name} — Full-Stack Developer`,
  description: site.subhead,
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
