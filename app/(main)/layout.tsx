import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin CRM System",
  description: "Admin panel for managing users and staff",
  keywords: ["admin", "crm", "dashboard", "management"],
  authors: [{ name: "Asomiddin" }],
  creator: "Asomiddin",
  openGraph: {
    title: "Admin CRM System",
    description: "Professional CRM dashboard",
    url: "https://yourdomain.com",
    siteName: "Admin CRM",
    locale: "en_US",
    type: "website",
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
