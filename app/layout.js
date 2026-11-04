import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  weight: ["500", "600", "700", "800"],
});

export const metadata = {
  title: "Остриё — барбершоп в Казани",
  description: "Стрижка, борода и запись онлайн. Казань, ул. Островского, 12.",
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("ostrio-theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
