import Link from "next/link";
import { formatMoney } from "../../lib/salon.js";
import { ServiceIcon } from "./content.js";

export default function ServicesSection({ services }) {
  return (
    <section className="section" id="services">
      <div className="shell">
        <div className="section-head">
          <div>
            <p className="eyebrow">Услуги салона</p>
            <h2>Что делаем за креслом</h2>
          </div>
          <Link className="btn btn-primary" href="/book">
            Записаться
          </Link>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.id}>
              <div className="icon-wrap">
                <ServiceIcon name={service.name} />
              </div>
              <h3>{service.name}</h3>
              <p>{service.duration_min} минут в смене мастера</p>
              <span className="price">{formatMoney(service.price)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
