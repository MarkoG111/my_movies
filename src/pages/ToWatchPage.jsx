import { useEffect, useState } from "react";
import { getToWatchIds } from "../services/moviesService";
import { getMovieDetails } from "../api/tmdb";

export default function ToWatchPage() {
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const ids = getToWatchIds().slice(0, 5);

        Promise.all(ids.map(id => getMovieDetails(id))).then(setMovies).catch(err => setError(err.message));
    }, []);

    console.log(movies);

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Movies To Watch</h1>
            <pre>{JSON.stringify(movies, null, 2)}</pre>
        </div>
    );
}