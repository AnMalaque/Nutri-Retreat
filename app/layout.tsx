import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutri Retreat – Filipino Food Exchange Tracker",
  description: "Track your nutrition using the Filipino Food Exchange Lists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased selection:bg-orange-500/30">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}