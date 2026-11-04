import Link from "next/link";
import { SALON } from "../../lib/salon.js";
import { CONTACT_PHOTO } from "./content.js";

export default function ContactsSection({ bot }) {
  return (
    <section className="section" id="contact" style={{ paddingTop: 0 }}>
      <div className="shell split">
        <div>
          <p className="eyebrow">Контакты</p>
          <h2>Приходите на Островского, 12</h2>
          <p>
            {SALON.city}, телефон салона {SALON.phone}. Запись через сайт
            или Telegram сразу попадает в журнал.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/book">
              Открыть бланк
            </Link>
            {bot && (
              <a className="btn btn-outline" href={`https://t.me/${bot}`}>
                Написать боту
              </a>
            )}
          </div>
        </div>
        <div className="about-photo">
          <img src={CONTACT_PHOTO} alt="Стрижка в салоне" />
        </div>
      </div>
    </section>
  );
}
