import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import PageHero from "../../components/PageHero";
import BookingWizard from "../../components/BookingWizard";

export const metadata = {
  title: "Запись — Остриё",
};

export default function BookPage() {
  return (
    <>
      <SiteHeader />
      <PageHero
        crumbs="Главная / Запись"
        title="Онлайн-запись"
        text="Выберите услугу, мастера, день и время. Заявка сразу появится в журнале салона."
      />
      <BookingWizard />
      <SiteFooter bot={process.env.NEXT_PUBLIC_BOT_USERNAME} />
    </>
  );
}
