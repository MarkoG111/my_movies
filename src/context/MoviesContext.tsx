import React, { createContext, useContext, useState, ReactNode } from "react";
import { Movie } from "../types/Movie";
import { fakeMovies } from "../data/fakeMovies";

interface MoviesProviderProps {
  children: ReactNode;
}

interface MoviesContextValue {
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;

  moveToWatched: (id: string) => void;
  moveToToWatch: (id: string) => void;
  removeMovie: (id: string) => void;
}

const MoviesContext = createContext<MoviesContextValue | undefined>(undefined);

export function MoviesProvider({ children }: MoviesProviderProps) {
  const [movies, setMovies] = useState<Movie[]>(fakeMovies);

  const moveToWatched = (id: string) => {
    setMovies((prev) =>
      prev.map((m) => (m.imdbId === id ? { ...m, status: "watched" } : m))
    );
  };

  const moveToToWatch = (id: string) => {
    setMovies((prev) =>
      prev.map((m) => (m.imdbId === id ? { ...m, status: "toWatch" } : m))
    );
  };

  const removeMovie = (id: string) => {
    setMovies((prev) => prev.filter((m) => m.imdbId !== id));
  };

  return (
    <MoviesContext.Provider
      value={{
        movies,
        setMovies,
        moveToToWatch,
        moveToWatched,
        removeMovie,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
}

export function useMoviesContext() {
  const ctx = useContext(MoviesContext);

  if (!ctx) {
    throw new Error("useMoviesContext must be used inside MoviesProvider");
  }

  return ctx;
}
