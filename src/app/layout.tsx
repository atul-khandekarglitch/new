import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Connector — Turn Industrial By-Products into Valuable Resources",
  description: "Connector uses intelligent material matching, material-flow analysis, and cost-aware industrial networking to help manufacturers discover reusable materials, reduce waste, and build a more circular supply chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
