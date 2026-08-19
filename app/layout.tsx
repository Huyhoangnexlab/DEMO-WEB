import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { AppProvider } from "@/components/AppProvider";

export const metadata: Metadata = {
  title: "Nexlab HR — Workspace App",
  description:
    "Ứng dụng quản lý nhân sự chuyên nghiệp tích hợp Nexlab Intelligent Hub Context SDK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50/70 text-slate-900 antialiased flex flex-col">
        <AppProvider>
          <Nav />
          <div className="flex-1 w-full max-w-7xl mx-auto py-2">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
