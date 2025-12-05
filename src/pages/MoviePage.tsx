import { useState } from "react";
import MovieHeader from "../components/movies/MovieHeader";
import MovieList from "../lists/MovieList";
import { useMovies } from "../hooks/useMovies";

interface MoviePageProps {
  type: "toWatch" | "watched";
}

export default function MoviePage({ type }: MoviePageProps) {
  const {
    toWatchMovies,
    watchedMovies,
    moveToWatched,
    moveToToWatch,
    removeMovie,
  } = useMovies();

  // Decide what content this page should display
  const movies = type === "toWatch" ? toWatchMovies : watchedMovies;
  const toggle = type === "toWatch" ? moveToWatched : moveToToWatch;

  // Filter state (shared structure)
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  const allGenres = ["all"];
  const onApplyFilters = () => console.log("apply filters");

  return (
    <>
      <MovieHeader
        toWatchCount={toWatchMovies.length}
        watchedCount={watchedMovies.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        sortBy={sortBy}
        setSortBy={setSortBy}
        allGenres={allGenres}
        onApplyFilters={onApplyFilters}
      />

      <MovieList
        movies={movies}
        onToggleStatus={toggle}
        onRemove={removeMovie}
      />
    </>
  );
}
