import BookingWizard from "../../components/BookingWizard";
import MiniPreviewBar from "../../components/MiniPreviewBar";

export default function MiniPage() {
  return (
    <main className="mini-app">
      <MiniPreviewBar />
      <p className="eyebrow">Барбершоп «Остриё»</p>
      <h1>Запись к мастеру</h1>
      <BookingWizard variant="mini" />
    </main>
  );
}
