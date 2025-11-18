import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const newYorkLarge = localFont({
  src: "../assets/fonts/NewYorkLargeRegular.otf",
  variable: "--font-new-york-large",
  display: "swap",
});

const newYorkRegular = localFont({
  src: "../assets/fonts/NewYork-Regular.otf",
  variable: "--font-new-york-regular",
  display: "swap",
});

const manrope =   Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const manropeMono = Manrope({
  variable: "--font-manrope-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jikonify",
  description: "Jikonify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${newYorkLarge.variable} ${newYorkRegular.variable} ${manropeMono.variable} ${manrope.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
