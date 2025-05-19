import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Roboto_Slab,
  Instrument_Serif,
  Knewave,
  Zeyada,
} from "next/font/google";
import "./globals.css";

// Import fonts with variables
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const knewave = Knewave({
  variable: "--font-knewave",
  subsets: ["latin"],
  weight: "400",
});

const zeyada = Zeyada({
  variable: "--font-zeyada",
  subsets: ["latin"],
  weight: "400",
});

// Set the metadata for the page
export const metadata: Metadata = {
  title: "bhargav",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${robotoSlab.variable} ${instrumentSerif.variable} ${knewave.variable} ${zeyada.variable} antialiased dark bg-background dark:bg-background-dark w-screen flex items-center justify-center min-h-screen text-foreground dark:text-foreground-dark font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
