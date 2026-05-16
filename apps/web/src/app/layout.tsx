import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BugReportWidget } from "@/components/BugReportWidget";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KAIA – Kinetic AI Agent",
  description:
    "Ein KI-Lernbegleiter der ausschließlich Fragen stellt. Masterthesis Dagmar Rostek, SRH Fernhochschule Riedlingen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <BugReportWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
