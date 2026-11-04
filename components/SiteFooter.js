import Link from "next/link";
import Logo from "./Logo";
import { SALON } from "../lib/salon.js";

export default function SiteFooter({ bot }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p>
            Барбершоп в Казани: короткая стрижка, ровная борода и запись без
            очереди у вешалки.
          </p>
        </div>
        <div>
          <h4>Навигация</h4>
          <ul>
            <li>
              <Link href="/">Главная</Link>
            </li>
            <li>
              <Link href="/#services">Услуги</Link>
            </li>
            <li>
              <Link href="/#team">Мастера</Link>
            </li>
            <li>
              <Link href="/book">Запись</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Контакты</h4>
          <ul>
            <li>
              {SALON.city}, {SALON.address}
            </li>
            <li>{SALON.phone}</li>
            <li>hello@ostrio.salon</li>
            {bot && (
              <li>
                <a href={`https://t.me/${bot}`}>Telegram-бот</a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4>Часы салона</h4>
          <p>Каждый мастер работает по своему графику. Окно выбирается на бланке записи.</p>
        </div>
      </div>
      <div className="footer-copy">
        <div className="shell">Остриё © {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}
