import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";

import { supabase } from "../lib/supabase";
import { useAuthContext } from "./AuthContext";
import { Movie, MovieDictionary } from "../types/Movie";

import moviesDict from "../data/moviesDict.json";

interface MoviesProviderProps {
    children: ReactNode;
}

interface MoviesContextValue {
    toWatchMovies: Movie[];
    watchedMovies: Movie[];
    allMovies: Movie[];
    addMovie: (imdbId: string, status: "watched" | "toWatch") => Promise<void>;
    moveToWatched: (imdbId: string) => Promise<void>;
    moveToToWatch: (imdbId: string) => Promise<void>;
    removeMovie: (imdbId: string) => Promise<void>;
}

const MoviesContext = createContext<MoviesContextValue | null>(null);

// Cast the imported JSON to the expected type to allow proper string indexing
const movieData: MovieDictionary = moviesDict as MovieDictionary;

export function MoviesProvider({ children }: MoviesProviderProps) {
    const { user } = useAuthContext();

    const [movies, setMovies] = useState<Movie[]>([]);
    const userId = user?.id;

    // Load user's movie list from Supabase
    useEffect(() => {
        if (!userId) {
            setMovies([]);
            return;
        }

        async function loadMovies() {
            const data = await fetchAllMovies(userId!);

            // Merge Supabase rows with local TMDB data
            const fullMovies = data
                .map((row) => {
                    const details = movieData[row.imdb_id];
                    if (!details) {
                        return null;
                    }

                    return {
                        ...details,
                        imdbId: details.imdbId,
                        status: row.status,
                    } as Movie;
                })
                .filter((m): m is Movie => {
                    if (!m) {
                        console.warn("MISSING MOVIE DETAILS FOR: ", m);
                        return false;
                    }
                    return true;
                });

            setMovies(fullMovies);
        }

        loadMovies();
    }, [userId]);

    async function fetchAllMovies(userId: string) {
        const pageSize = 1000;
        let from = 0;
        let all = [];

        while (true) {
            const { data, error } = await supabase
                .from("movies")
                .select("imdb_id, status", { count: "exact" })
                .eq("user_id", userId)
                .order("created_at", { ascending: true })
                .range(from, from + pageSize - 1);

            if (error) {
                console.error("Supabase pagination error:", error);
                break;
            }

            if (!data || data.length === 0) {
                break;
            }

            all.push(...data);

            if (data.length < pageSize) {
                break; // last page
            }

            from += pageSize;
        }

        return all;
    }

    // Add movie
    async function addMovie(imdbId: string, status: "watched" | "toWatch") {
        if (!userId) {
            return;
        }

        await supabase.from("movies").insert({
            user_id: userId,
            imdb_id: imdbId,
            status,
        });

        const d = movieData[imdbId];
        if (!d) {
            return;
        }

        setMovies((prev: Movie[]) => [...prev, { ...d, status }]);
    }

    // Move to watched
    async function moveToWatched(imdbId: string) {
        if (!userId) {
            return;
        }

        await supabase
            .from("movies")
            .update({ status: "watched" })
            .eq("user_id", userId)
            .eq("imdb_id", imdbId);

        setMovies((prev) =>
            prev.map((m) =>
                m.imdbId === imdbId ? { ...m, status: "watched" } : m
            )
        );
    }

    // Move to toToWatch
    async function moveToToWatch(imdbId: string) {
        if (!userId) {
            return;
        }

        await supabase
            .from("movies")
            .update({ status: "toWatch" })
            .eq("user_id", userId)
            .eq("imdb_id", imdbId);

        setMovies((prev) =>
            prev.map((m) =>
                m.imdbId === imdbId ? { ...m, status: "toWatch" } : m
            )
        );
    }

    // Remove movie
    async function removeMovie(imdbId: string) {
        if (!userId) {
            return;
        }

        await supabase
            .from("movies")
            .delete()
            .eq("user_id", userId)
            .eq("imdb_id", imdbId);

        setMovies((prev) => prev.filter((m) => m.imdbId !== imdbId));
    }

    const toWatchMovies = movies.filter((m) => m.status === "toWatch");
    const watchedMovies = movies.filter((m) => m.status === "watched");

    return (
        <MoviesContext.Provider
            value={{
                allMovies: movies,
                toWatchMovies,
                watchedMovies,
                addMovie,
                moveToWatched,
                moveToToWatch,
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
