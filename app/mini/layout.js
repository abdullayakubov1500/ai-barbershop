import Script from "next/script";

export const metadata = {
  title: "Запись — Остриё",
  robots: { index: false, follow: false },
};

export default function MiniLayout({ children }) {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      {children}
    </>
  );
}
