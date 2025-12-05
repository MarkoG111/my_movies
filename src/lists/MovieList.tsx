import { useEffect, useRef, useState } from "react";
import MovieItem from "./MovieItem";
import BackToTopButton from "../components/layout/BackToTopButton";
import { Movie } from "../types/Movie";

interface MovieListProps {
  movies: Movie[];
  onToggleStatus: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function MovieList({
  movies,
  onToggleStatus,
  onRemove,
}: MovieListProps) {
  const [visibleCount, setVisibleCount] = useState(18);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 18);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const visibleMovies = movies.slice(0, visibleCount);

  return (
    <div className="mx-auto px-4 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10">
        {visibleMovies.map((movie) => (
          <MovieItem
            key={movie.imdbId}
            movie={movie}
            onToggleStatus={() => onToggleStatus(movie.imdbId)}
            onRemove={() => onRemove(movie.imdbId)}
          />
        ))}
      </div>

      <div
        ref={loaderRef}
        className="h-10 mt-10 flex justify-center text-gray-400"
      >
        Loading more...
      </div>

      <BackToTopButton />
    </div>
  );
}
