import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Auarlis — Parkinson's Early Detection",
  description:
    "Screen for early Parkinson's indicators using voice biomarker analysis and computer-vision motor assessment. No clinic. No hardware. Under 5 minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
        <ToastProvider>
          <AuthGuard>
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
          </AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
