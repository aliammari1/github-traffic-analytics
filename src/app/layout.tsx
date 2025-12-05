import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitHub Traffic Analytics",
  description: "Track and analyze traffic for your GitHub repositories with beautiful visualizations.",
  keywords: "GitHub, Analytics, Traffic, Repositories, Developer Tools",
  openGraph: {
    title: "GitHub Traffic Analytics",
    description: "Track and analyze traffic for your GitHub repositories",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <SessionProvider>
          <div className="min-h-screen">
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
