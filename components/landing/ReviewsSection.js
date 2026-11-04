import { REVIEWS } from "./content.js";

export default function ReviewsSection() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="shell">
        <p className="eyebrow">Отзывы</p>
        <h2>Что говорят после стрижки</h2>
        <div className="review-grid" style={{ marginTop: 28 }}>
          {REVIEWS.map((review) => (
            <article className="review-card" key={review.name}>
              <p>{review.text}</p>
              <h3 style={{ marginTop: 16 }}>{review.name}</h3>
              <p>{review.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
