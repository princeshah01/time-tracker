import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@workspace/ui/globals.css";

import { env } from "../env";

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "Next.js workspace app wired to shared UI and env packages.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
