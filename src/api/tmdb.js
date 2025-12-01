const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function getMovieDetails(movieId) {
    if (!API_KEY || !BASE_URL) {
        console.error("API Key or Base URL is missing! Check your .env file and ensure variables start with VITE_");
        return null;
    }

    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);

    if (!response.ok) {
        throw new Error(`HTTP error! status:  ${response.status}`);
    }
    
    return response.json();
}