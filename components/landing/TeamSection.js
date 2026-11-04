import { TEAM_PHOTOS } from "./content.js";

export default function TeamSection({ barbers }) {
  return (
    <section className="section" id="team" style={{ paddingTop: 0 }}>
      <div className="shell">
        <p className="eyebrow">Команда</p>
        <h2>Кто стрижёт</h2>
        <div className="team-grid" style={{ marginTop: 28 }}>
          {barbers.map((barber, index) => (
            <article className="team-card" key={barber.id}>
              <img src={TEAM_PHOTOS[index % TEAM_PHOTOS.length]} alt={barber.name} />
              <h3>{barber.name}</h3>
              <p>{barber.specialty}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
