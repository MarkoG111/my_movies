import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env.TMDB_BASE_URL;

async function fetchMovieData(imdbId) {
    try {
        // Step 1: Get TMDB ID
        const findRes = await fetch(
            `${BASE_URL}/find/${imdbId}?api_key=${API_KEY}&external_source=imdb_id`
        );

        const findData = await findRes.json();
        const tmdbId = findData.movie_results?.[0]?.id;

        if (!tmdbId) {
            return null;
        }

        // Step 2: Get movie details
        const movieRes = await fetch(
            `${BASE_URL}/movie/${tmdbId}?api_key=${API_KEY}`
        );

        const movie = await movieRes.json();

        return {
            imdbId,
            title: movie.title,
            year: Number(movie.release_date?.slice(0, 4) ?? 0),
            rating: Number(movie.vote_average?.toFixed(1) ?? 0),
            runtime: movie.runtime ?? 0,
            poster: movie.poster_path
                ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
                : '',
            genres: movie.genres?.map(g => g.name) ?? [],
        };
    } catch (error) {
        console.error(`Failed to fetch ${imdbId}:`, error);
        return null;
    }
}

async function prefetchList(inputFile, outputFile) {
    const ids = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    const results = [];

    console.log(`Fetching ${ids.length} movies...`);

    // Process in batches of 10 to avoid rate limits
    for (let i = 0; i < ids.length; i += 10) {
        const batch = ids.slice(i, i + 10);

        const batchResults = await Promise.all(
            batch.map(id => fetchMovieData(id))
        );

        results.push(...batchResults.filter(Boolean));
        console.log(`Progress: ${results.length}/${ids.length}`);

        // Rate limit: wait 1 second between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`✅ Saved ${results.length} movies to ${outputFile}`);
}

async function main() {
    await prefetchList(
        './src/data/toWatch.json',
        './src/data/toWatchFull.json'
    );

    await prefetchList(
        './src/data/watched.json',
        './src/data/watchedFull.json'
    );
}

main();