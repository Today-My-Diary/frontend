import { WiredFilms, type WiredFilm } from "@/components/WiredFilms";
import { FairyCharacter } from "@/components/FairyCharacter";

interface TodayWiredFilmsProps {
  films: WiredFilm[];
  onClick: (date: string) => void;
}

export function TodayWiredFilms({ films, onClick }: TodayWiredFilmsProps) {
  return (
    <section className="flex flex-col items-center gap-8">
      <div className="text-center">
        <FairyCharacter size={60} className="mx-auto mb-4" />
        <h2 className="text-secondary text-2xl font-bold">
          오늘은 언제의 나를 만나볼까요?
        </h2>
      </div>
      <WiredFilms films={films} onFilmClick={onClick} />
    </section>
  );
}
