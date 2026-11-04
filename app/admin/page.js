import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import PageHero from "../../components/PageHero";
import AdminApp from "../../components/AdminApp";

export const metadata = {
  title: "Админка — Остриё",
};

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <PageHero crumbs="Главная / Журнал" title="Журнал салона" text="Записи, мастера, график и загрузка недели." />
      <div className="admin-wrap">
        <AdminApp />
      </div>
      <SiteFooter />
    </>
  );
}
