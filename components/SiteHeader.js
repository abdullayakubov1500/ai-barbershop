"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Главная" },
  { href: "/#services", label: "Услуги" },
  { href: "/#team", label: "Мастера" },
  { href: "/book", label: "Запись" },
  { href: "/admin", label: "Админка" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="nav">
          {LINKS.map((link) => {
            const current =
              link.href === "/book"
                ? pathname === "/book"
                : link.href === "/admin"
                  ? pathname.startsWith("/admin")
                  : link.href === "/"
                    ? pathname === "/"
                    : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link className="btn btn-primary" href="/book">
            Записаться
          </Link>
        </div>
      </div>
    </header>
  );
}
