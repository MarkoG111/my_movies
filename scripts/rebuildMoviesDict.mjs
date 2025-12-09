import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// CONFIG
const OUTPUT_PATH = "./src/data/moviesDict.json";
const MISSING_OUTPUT_PATH = "./src/data/missingMovies.json";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tmdbApiKey = process.env.VITE_TMDB_API_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}
if (!tmdbApiKey) {
    console.error("❌ Missing VITE_TMDB_API_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/*---------------------------------------------------------
  STEP 1: FETCH ALL IMDb IDs USING PAGINATED RPC
---------------------------------------------------------*/
async function fetchAllImdbIds() {
    const limit = 1000;
    let offset = 0;
    let all = [];

    while (true) {
        console.log(`📥 Fetching IDs offset ${offset}…`);

        const { data, error } = await supabase.rpc(
            "get_all_imdb_ids_paginated",
            {
                p_limit: limit,
                p_offset: offset
            }
        );

        if (error) {
            console.error("❌ Supabase RPC error:", error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;

        all.push(...data.map((d) => d.imdb_id));
        offset += limit;
    }

    const unique = [...new Set(all)];
    console.log(`✅ Total IMDb IDs fetched: ${unique.length}`);

    return unique;
}

/*---------------------------------------------------------
  STEP 2: FETCH MOVIE DETAILS FROM TMDB
---------------------------------------------------------*/
async function fetchTMDBDetailsOnce(imdbId) {
    // Resolve TMDB ID
    const findUrl = `${TMDB_BASE}/find/${imdbId}?api_key=${tmdbApiKey}&external_source=imdb_id`;

    const findRes = await fetch(findUrl);
    if (!findRes.ok) return null;

    const findData = await findRes.json();
    const tmdbId = findData.movie_results?.[0]?.id;
    if (!tmdbId) return null;

    // Fetch details
    const movieUrl = `${TMDB_BASE}/movie/${tmdbId}?api_key=${tmdbApiKey}`;
    const movieRes = await fetch(movieUrl);

    if (!movieRes.ok) return null;

    const movie = await movieRes.json();

    return {
        imdbId,
        title: movie.title,
        year: Number(movie.release_date?.slice(0, 4)) || 0,
        rating: Number(movie.vote_average?.toFixed(1)) || 0,
        runtime: movie.runtime || 0,
        poster: movie.poster_path ? IMG + movie.poster_path : "",
        genres: movie.genres?.map((g) => g.name) || [],
    };
}

// retry wrapper
async function fetchTMDBDetailsWithRetry(imdbId, maxAttempts = 3) {
    let attempt = 1;

    while (attempt <= maxAttempts) {
        try {
            const res = await fetchTMDBDetailsOnce(imdbId);
            if (res) return res;
        } catch (err) {
            console.warn(`⚠️ Attempt ${attempt} failed for ${imdbId}`, err);
        }

        attempt++;
        await sleep(500 * attempt); // exponential backoff
    }

    console.error(`❌ TMDB FAILED permanently for: ${imdbId}`);
    return null;
}

/*---------------------------------------------------------
  STEP 3: REBUILD DICTIONARY
---------------------------------------------------------*/
async function rebuild() {
    console.log("🚀 Starting dictionary rebuild…");

    const imdbIds = await fetchAllImdbIds();
    const dict = {};
    const missing = [];

    const batchSize = 10;
    const totalBatches = Math.ceil(imdbIds.length / batchSize);

    for (let i = 0; i < imdbIds.length; i += batchSize) {
        const batchIndex = i / batchSize + 1;
        const batch = imdbIds.slice(i, i + batchSize);

        console.log(
            `🎬 Batch ${batchIndex}/${totalBatches} — IDs ${i + 1}–${i + batch.length}`
        );

        const results = await Promise.all(
            batch.map((id) => fetchTMDBDetailsWithRetry(id))
        );

        results.forEach((movie, idx) => {
            const id = batch[idx];
            if (movie) dict[id] = movie;
            else missing.push(id);
        });

        await sleep(1000); // TMDB rate limit safety
    }

    console.log("📝 Writing moviesDict.json…");
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dict, null, 2));

    console.log(`✅ Saved ${Object.keys(dict).length} movies.`);

    if (missing.length > 0) {
        console.warn(`⚠️ Missing: ${missing.length} movies. Writing missingMovies.json…`);
        fs.writeFileSync(MISSING_OUTPUT_PATH, JSON.stringify(missing, null, 2));
    }

    console.log("🎉 Dictionary rebuild complete!");
    process.exit(0);
}

rebuild().catch((err) => {
    console.error("💥 Unhandled script error:", err);
    process.exit(1);
});
