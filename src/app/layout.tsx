import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyBook — Premium Flight Booking",
  description:
    "SkyBook makes it easy to search, compare, and book flights across 15 world-class airlines with a fast, secure booking experience.",
  openGraph: {
    title: "SkyBook — Premium Flight Booking",
    description:
      "Search, compare, and book flights across 15 world-class airlines with SkyBook.",
    siteName: "SkyBook",
  },
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
