import MovieCard from "../components/movies/MovieCard";
import { Movie } from "../types/Movie";

interface MovieItemProps {
  movie: Movie;
  onToggleStatus: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function MovieItem({
  movie,
  onToggleStatus,
  onRemove,
}: MovieItemProps) {
  return (
    <MovieCard
      movie={movie}
      onToggleStatus={onToggleStatus}
      onRemove={onRemove}
    />
  );
}
