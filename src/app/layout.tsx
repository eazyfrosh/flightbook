import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DemoBanner } from "@/components/layout/demo-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyBook — Premium Flight Booking (Demo)",
  description:
    "SkyBook is a premium flight-booking portfolio demo with mock airlines and fares, and a free simulated booking flow. No real bookings are processed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <div className="no-print">
              <DemoBanner />
              <Header />
            </div>
            <main className="flex-1">{children}</main>
            <div className="no-print">
              <Footer />
            </div>
            <div className="no-print">
              <Toaster position="top-center" richColors closeButton />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
