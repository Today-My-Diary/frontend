import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface WiredFilmsProps {
  films: WiredFilm[];
  onFilmClick?: (date: string) => void;
}

export interface WiredFilm {
  id: string;
  date: string;
  title: string;
  thumbnailUrl: string;
}

export function WiredFilms({ films, onFilmClick }: WiredFilmsProps) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="bg-secondary h-0.5 w-[70%] rounded-full" />
      <div className="flex justify-center gap-8 pt-2">
        {films.map((film, index) => (
          <button
            key={film.id}
            type="button"
            onClick={() => onFilmClick?.(film.date)}
            className={cn(
              "relative flex flex-col items-center",
              index === 0 ? "flex" : "hidden md:flex",
              onFilmClick && "cursor-pointer",
            )}
          >
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
          </button>
        ))}
      </div>
    </div>
  );
}
