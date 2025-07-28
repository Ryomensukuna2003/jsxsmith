import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "@/components/sessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JsxSmith - AI Code Assistant",
  description: "Use this tool to generate React components using AI so you can focus on building your application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionWrapper>
            {children}
            <Toaster />
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
