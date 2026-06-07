import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { BugReportWidget } from "@/components/BugReportWidget";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KAIA – Kinetic AI Agent",
  description:
    "Ein KI-Lernbegleiter der ausschließlich Fragen stellt. Masterthesis Dagmar Rostek, SRH Fernhochschule.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Privacy-friendly analytics by Plausible — kein Cookie-Banner nötig, DSGVO-konform */}
        <script async src="https://plausible.io/js/pa-iS1_crwpQgu5D2TyMy8Eb.js" />
        <script dangerouslySetInnerHTML={{ __html: "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()" }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <BugReportWidget />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
