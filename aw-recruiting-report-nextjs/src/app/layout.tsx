import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";
import { DialogProvider } from "@/context/DialogContext";
import { ScannerProvider } from "@/context/ScannerContext";
import { AppTourProvider } from "@/components/tour/AppTourProvider";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RouteGuard } from "@/components/auth/RouteGuard";

export const metadata: Metadata = {
  title: "AW-Recruiting-report",
  description: "Hệ thống quản lý và báo cáo tuyển dụng - AW",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#eaedf0",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="font-sans antialiased min-h-[100dvh] w-full overflow-x-hidden bg-[#eaedf0] dark:bg-[#121214] text-slate-900 dark:text-[#F1F2F4] transition-colors duration-200 flex flex-col"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-rose-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold"
        >
          Chuyển đến nội dung chính
        </a>
        <SessionProvider>
          <RouteGuard>
            <DialogProvider>
              <ScannerProvider>
                <AppTourProvider>
                  <Header />
                  <main id="main-content" className="flex-1 w-full flex flex-col min-h-0 overflow-y-auto pb-16 md:pb-0">
                    {children}
                  </main>
                  <MobileBottomNav />
                </AppTourProvider>
              </ScannerProvider>
            </DialogProvider>
          </RouteGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
