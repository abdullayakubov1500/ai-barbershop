"use client";

import { useEffect, useState } from "react";

function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("ostrio-theme", next);
    setTheme(next);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.5-2.5a1 1 0 1 1 0-2H18a1 1 0 1 1 0 2h1.5ZM7 12a1 1 0 0 1-1 1H4.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1 1Zm9.6 5.1a1 1 0 0 1 0 1.4l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0ZM9.87 6.44 8.81 5.38A1 1 0 0 1 10.22 4l1.06 1.06A1 1 0 1 1 9.87 6.44Zm1.06 12.18L9.87 19.68A1 1 0 0 1 8.46 18.3l1.06-1.06a1 1 0 0 1 1.41 1.41Zm8.29-12.18a1 1 0 0 1-1.41 0L16.75 5.38A1 1 0 1 1 18.16 4l1.06 1.06a1 1 0 0 1 0 1.41Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19 13.5A7.5 7.5 0 0 1 10.5 5 7.5 7.5 0 1 0 19 13.5Z"
          />
        </svg>
      )}
    </button>
  );
}
