import { Card } from "./ui/card";

// TODO: 추후 DTO에 맞춰 적합한 모델로 분리
interface WiredFilmsProps {
  films: WiredFilm[];
}

interface WiredFilm {
  id: number;
  date: string;
  title: string;
  thumbnailUrl: string;
}
//

export function WiredFilms({ films }: WiredFilmsProps) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="bg-secondary h-0.5 w-[70%] rounded-full" />
      <div className="flex justify-center gap-8 pt-2">
        {films.map((film) => (
          <div key={film.id} className="relative flex flex-col items-center">
            <div className="bg-secondary absolute -top-4 z-10 h-5 w-2.5 rounded-full" />
            <Card variant="white" padding="none" className="w-72">
              <img
                src={film.thumbnailUrl}
                alt={film.title}
                className="h-64 w-full object-cover"
                loading="lazy"
              />
              <div className="text-secondary px-6 pt-4 pb-6 text-center">
                <span className="mb-2 block text-sm">{film.date}</span>
                <span className="text-lg font-semibold">{film.title}</span>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
