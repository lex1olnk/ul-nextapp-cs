import type { Metadata } from "next";
import { Nunito, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { IntroAnimation } from "@/components/IntroAnimation";
import { Navbar } from "@/components/Navbar";

const shareTechMono = Share_Tech_Mono({
  variable: "--font-stm",
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ULMIXCUP",
  description: "CS2STATS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={shareTechMono.variable}>
        <IntroAnimation />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
