import { cookies } from "next/headers";
import { Onest, Unbounded } from "next/font/google";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
});

export const metadata = {
  title: "PLATE.UZ — комплектующие и сборка ПК",
  description: "Магазин комплектующих, конструктор ПК и оценка FPS. Цены в сумах.",
};

export default async function RootLayout({ children }) {
  const jar = await cookies();
  const locale = jar.get("locale")?.value === "uz" ? "uz" : "ru";

  return (
    <html lang={locale} className={`${onest.variable} ${unbounded.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <Providers locale={locale}>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
