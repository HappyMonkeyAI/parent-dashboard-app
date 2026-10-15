import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/providers";
import { NavHeader } from "@/components/nav-header";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "CheckIn Kids",
  description:
    "A calm, predictable daily routine dashboard for children and their parents.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-ink antialiased">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            themes={["light", "low-stim"]}
            enableSystem={false}
          >
            <NavHeader />
            {children}
            <ServiceWorkerRegister />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
