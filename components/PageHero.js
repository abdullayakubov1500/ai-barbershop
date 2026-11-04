export default function PageHero({ title, text, crumbs }) {
  return (
    <section className="page-hero">
      <div className="shell">
        {crumbs && <p className="crumbs">{crumbs}</p>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}
