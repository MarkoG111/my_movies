import { useMoviesContext } from "../context/MoviesContext";

export function useMovies() {
    const { allMovies, moveToWatched, moveToToWatch, removeMovie } =
        useMoviesContext();

    const toWatchMovies = allMovies.filter((m) => m.status === "toWatch");
    const watchedMovies = allMovies.filter((m) => m.status === "watched");

    return {
        allMovies,
        toWatchMovies,
        watchedMovies,
        moveToToWatch,
        moveToWatched,
        removeMovie,
    };
}
