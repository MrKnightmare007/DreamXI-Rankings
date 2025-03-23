import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dream11 Rankings",
  description: "Track your Dream11 performance and compete with friends",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 min-h-screen`}
      >
        <div className="container mx-auto px-4">
          <header className="py-4">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Dream11 Rankings</h1>
          </header>
          <main className="py-8">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
