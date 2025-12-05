import { useEffect, useState, useRef } from "react";
import { getMovieDetails } from "../api/tmdb";

const CACHE_KEY = "movieDetailsCache";
let inFlightRequests = {};

function loadCache() {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveCache(cache) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function useMovieDetails(imdbId) {
    const [details, setDetails] = useState(() => {
        if (!imdbId) return null;

        const cache = loadCache();
        
        return cache[imdbId] || null;
    });

    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                }
            },
            { rootMargin: "200px" }
        );

        const currentElement = elementRef.current;
        observer.observe(currentElement);

        return () => {
            observer.unobserve(currentElement);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!imdbId || !isVisible || details) return;

        if (inFlightRequests[imdbId]) {
            inFlightRequests[imdbId].then((data) => setDetails(data));
            return;
        }


        inFlightRequests[imdbId] = getMovieDetails(imdbId)
            .then((data) => {
                const formatted = {
                    imdbId,
                    title: data.title,
                    year: data.release_date?.slice(0, 4),
                    poster: data.poster_path
                        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                        : "https://image.tmdb.org/t/p/w300_and_h450_bestv2/none.jpg",
                    genres: data.genres?.map(g => g.name) ?? [],
                    runtime: data.runtime,
                    rating: data.vote_average.toFixed(1),
                };
                const cache = loadCache();
                cache[imdbId] = formatted;
                saveCache(cache);
                setDetails(formatted);
                return formatted;
            })
            .finally(() => {
                delete inFlightRequests[imdbId];
            });
    }, [imdbId, isVisible, details]);

    return { details, elementRef };
}