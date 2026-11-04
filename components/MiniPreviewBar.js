"use client";

import { useEffect, useState } from "react";

export default function MiniPreviewBar() {
  const [localPreview, setLocalPreview] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const insideTelegram = Boolean(window.Telegram?.WebApp?.initData);
    setLocalPreview(!insideTelegram);
    setTheme(document.documentElement.dataset.theme || "light");
  }, []);

  if (!localPreview) {
    return null;
  }

  function applyTheme(next) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem("ostrio-theme", next);
    setTheme(next);
  }

  return (
    <p className="mini-preview">
      Локальный предпросмотр Mini App. Календарь и запись работают в браузере.
      <span className="mini-preview-themes">
        <button
          type="button"
          className={`btn ${theme === "light" ? "btn-primary" : "btn-outline"}`}
          onClick={() => applyTheme("light")}
        >
          Светлая
        </button>
        <button
          type="button"
          className={`btn ${theme === "dark" ? "btn-primary" : "btn-outline"}`}
          onClick={() => applyTheme("dark")}
        >
          Тёмная
        </button>
      </span>
    </p>
  );
}
