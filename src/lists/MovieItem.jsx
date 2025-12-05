import { useMovieDetails } from "../hooks/useMovieDetails";
import MovieCard from "../components/MovieCard";
import React from "react";

const MovieItem = React.memo(({ movie, onToggleStatus, onRemove }) => {
    const { details, elementRef } = useMovieDetails(movie.imdbId);

    const fullMovie = details
        ? {
            ...details,
            status: movie.status,
            addedAt: movie.addedAt,
        }
        : null;

    return (
        <div ref={elementRef}>
            {fullMovie ? (
                <MovieCard
                    movie={fullMovie}
                    onToggleStatus={onToggleStatus}
                    onRemove={onRemove}
                />
            ) : (
                <div className="w-full h-full bg-slate-500 rounded-xl animate-pulse"></div>
            )}
        </div>
    );
});

export default MovieItem;

