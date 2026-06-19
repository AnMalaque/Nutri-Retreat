import type { Metadata } from "next";
import "./globals.css";
import CubeField from "@/components/CubeField";
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import NextTopLoader from 'nextjs-toploader';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CubeField />
        <NextTopLoader
          color="linear-gradient(to right, #C9AD7F, #A67C5B, #C9AD7F)"
          height={4}
          shadow="0 0 12px rgba(201, 173, 127, 0.4), 0 0 24px rgba(166, 124, 91, 0.2)"
          showSpinner={false}
          easing="ease"
          speed={400}
        />
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            classNames: {
              actionButton: 'fusion-toast-action',
              cancelButton: 'fusion-toast-cancel',
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
