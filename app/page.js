import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Particles from "../components/Particles";
import TypedWords from "../components/TypedWords";
import HeroBackground from "../components/HeroBackground";
import ServicesSection from "../components/landing/ServicesSection";
import TeamSection from "../components/landing/TeamSection";
import ReviewsSection from "../components/landing/ReviewsSection";
import ContactsSection from "../components/landing/ContactsSection";
import { ABOUT, STEPS } from "../components/landing/content.js";
import { getDb } from "../lib/db.js";
import { listServices } from "../lib/repositories/serviceRepository.js";
import { listBarbers } from "../lib/repositories/barberRepository.js";
import { listTodayAvailability } from "../lib/services/availabilityService.js";

export default function HomePage() {
  const db = getDb();
  const services = listServices(db);
  const barbers = listBarbers(db, { activeOnly: true });
  const today = listTodayAvailability(db);
  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <HeroBackground />
          <Particles />
          <div className="shell hero-grid">
            <div className="hero-copy">
              <h1>Точная форма. Спокойная посадка.</h1>
              <TypedWords />
              <p>
                Барбершоп на Островского: день, час и мастер выбираются на сайте
                или в Telegram. Без ожидания у вешалки.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/book">
                  Записаться
                </Link>
                <a className="btn btn-ghost" href="#services">
                  Смотреть услуги
                </a>
              </div>
            </div>
          </div>
        </section>

        <ServicesSection services={services} />

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell about-grid">
            <div>
              <p className="eyebrow">О салоне</p>
              <h2>Держим линию, а не очередь.</h2>
              <p>
                «Остриё» работает в Казани с четырьмя мастерами. График у каждого
                свой, поэтому бланк записи показывает только те окна, которые
                ещё свободны.
              </p>
              <div className="bars">
                <div className="bar">
                  <div className="label">
                    <span>Классика</span>
                    <span>90%</span>
                  </div>
                  <div className="meter-line">
                    <span style={{ width: "90%" }} />
                  </div>
                </div>
                <div className="bar">
                  <div className="label">
                    <span>Фейд</span>
                    <span>80%</span>
                  </div>
                  <div className="meter-line">
                    <span style={{ width: "80%" }} />
                  </div>
                </div>
                <div className="bar">
                  <div className="label">
                    <span>Борода</span>
                    <span>75%</span>
                  </div>
                  <div className="meter-line">
                    <span style={{ width: "75%" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="about-photo">
              <img src={ABOUT} alt="Интерьер барбершопа" />
            </div>
          </div>
        </section>

        <section className="stats-band">
          <div className="shell stats">
            <div>
              <strong>8</strong>
              лет на Островского
            </div>
            <div>
              <strong>4</strong>
              мастера в смене
            </div>
            <div>
              <strong>12к+</strong>
              стрижек в журнале
            </div>
            <div>
              <strong>21</strong>
              день горизонт записи
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <p className="eyebrow">Как записаться</p>
            <h2>Четыре шага до кресла</h2>
            <div className="process-grid" style={{ marginTop: 28 }}>
              {STEPS.map((step) => (
                <article className="step-card" key={step.n}>
                  <b>{step.n}</b>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <TeamSection barbers={barbers} />

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div className="section-head">
              <div>
                <p className="eyebrow">Сегодня</p>
                <h2>Кто свободен у кресла</h2>
              </div>
            </div>
            <div className="today-board">
              {today.map((barber) => (
                <article className="today-card" key={barber.id}>
                  <div>
                    <strong>{barber.name}</strong>
                    <p>{barber.specialty}</p>
                  </div>
                  <div>{barber.nextSlot ? `ближайшее ${barber.nextSlot}` : "смена закрыта"}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection />
        <ContactsSection bot={bot} />
      </main>
      <SiteFooter bot={bot} />
    </>
  );
}
