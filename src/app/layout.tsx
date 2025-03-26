import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./providers";
import Navigation from "./components/Navigation";
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
        <AuthProvider>
          <div className="container mx-auto px-4">
            <Navigation />
            <main className="py-4">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
