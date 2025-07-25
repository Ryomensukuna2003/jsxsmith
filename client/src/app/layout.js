import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "@/components/sessionProvider";

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
    <html lang="en">
      <SessionWrapper>
        <body
          suppressHydrationWarning={true}
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </SessionWrapper>
    </html>
  );
}
