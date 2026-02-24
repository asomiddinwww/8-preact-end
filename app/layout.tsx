"use client";

import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname } from "next/navigation";
import Hedaer from "@/components/Hedaer";
import { ModeToggle } from "@/components/mode";
import { useState, useEffect, useMemo } from "react";
import { RightOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { User as UserIcon } from "lucide-react";
import Link from "next/link";

// --- TANSTACK QUERY IMPORTLARI ---
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

const SITE_CONFIG = {
  name: "CRM Edu Panel",
  description: "O'quv markazlari uchun professional boshqaruv tizimi",
  url: "https://8-preact-end.vercel.app/",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = pathname === "/login";
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  // --- TANSTACK QUERY CLIENTNI YARATISH ---
  // SSR (Server Side Rendering) bilan muammo bo'lmasligi uchun useState ichida yaratamiz
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 daqiqa davomida ma'lumotlarni "eskirmagan" deb hisoblaydi
            retry: 1, // Xatolik bo'lsa 1 marta qayta urinadi
          },
        },
      }),
  );

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";

  const pageTitle = useMemo(() => {
    const titles: { [key: string]: string } = {
      "/": "Boshqaruv Paneli",
      "/menagers": "Menejerlar",
      "/admins": "Adminlar",
      "/teachers": "O'qituvchilar",
      "/students": "Talabalar",
      "/groups": "Guruhlar",
      "/courses": "Kurslar",
      "/payment": "To'lovlar",
      "/settings": "Sozlamalar",
      "/profile": "Profil Ma'lumotlari",
    };
    return titles[pathname] || "CRM Panel";
  }, [pathname]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${pageTitle} | ${SITE_CONFIG.name}`;
    }
  }, [pageTitle]);

  useEffect(() => {
    const savedUser = Cookies.get("user") || localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed.data ? parsed.data : parsed);
      } catch (e) {
        console.error("User parse error");
      }
    }
  }, [pathname]);

  const profileImg = useMemo(() => {
    if (!user?.image) return null;
    return user.image.startsWith("http")
      ? user.image
      : `${BASE_URL}/${user.image}`;
  }, [user, BASE_URL]);

  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <meta name="description" content={SITE_CONFIG.description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* QUERY CLIENT PROVIDER BILAN O'RAYMIZ */}
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen bg-background text-foreground">
              {!hideHeader && (
                <aside
                  className={`transition-all duration-300 ease-in-out border-r shrink-0 ${
                    isOpen ? "w-72" : "w-0 overflow-hidden border-none"
                  }`}
                >
                  <Hedaer isOpen={isOpen} />
                </aside>
              )}

              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!hideHeader && (
                  <header className="w-full flex justify-between border-b p-3 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle Sidebar"
                        className="p-2 rounded-lg hover:bg-accent transition active:scale-90"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                          ></rect>
                          <path d="M9 3v18"></path>
                        </svg>
                      </button>

                      <nav className="flex items-center font-medium text-sm md:text-base">
                        <span className="opacity-50">Asosiy</span>
                        <RightOutlined className="text-[10px] mx-2 opacity-30" />
                        <span className="font-semibold">{pageTitle}</span>
                      </nav>
                    </div>

                    <div className="flex gap-2 sm:gap-4 items-center">
                      <ModeToggle />

                      <Link
                        href="/profile"
                        className="flex items-center gap-2 sm:gap-3 p-1 pl-2 rounded-full hover:bg-accent transition-all border border-transparent hover:border-border"
                      >
                        <div className="text-right hidden sm:block leading-tight">
                          <h3 className="text-sm font-semibold truncate max-w-[120px]">
                            {user?.first_name || "Menejer"}
                          </h3>
                          <p className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">
                            {user?.role || "Manager"}
                          </p>
                        </div>

                        <div className="w-9 h-9 relative rounded-full overflow-hidden border-2 border-primary/10 bg-muted flex items-center justify-center">
                          {profileImg ? (
                            <img
                              src={profileImg}
                              alt="User avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon size={18} className="text-zinc-500" />
                          )}
                        </div>
                      </Link>
                    </div>
                  </header>
                )}

                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-background">
                  {children}
                </main>
              </div>
            </div>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
