import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/lib/providers/query-provider';
import { AuthProvider } from '@/lib/providers/auth-provider';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "homeTeam Admin Dashboard",
  description: "Admin dashboard for homeTeam family task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
