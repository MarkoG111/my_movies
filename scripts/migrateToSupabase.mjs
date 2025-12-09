import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const userId = process.env.SEED_USER_ID;

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const toWatch = JSON.parse(fs.readFileSync("./src/data/toWatchFull.json", "utf-8"));
const watched = JSON.parse(fs.readFileSync("./src/data/watchedFull.json", "utf-8"));

async function migrate() {
    console.log("Migrating movies…");

    // Combine lists
    const raw = [
        ...toWatch.map(m => ({ imdb_id: m.imdbId, status: "toWatch" })),
        ...watched.map(m => ({ imdb_id: m.imdbId, status: "watched" })),
    ];

    // Dedupe
    const unique = new Map();
    raw.forEach(r => {
        if (!unique.has(r.imdb_id)) {
            unique.set(r.imdb_id, r);
        }
    });

    const rows = [...unique.values()];
    console.log("Unique movies:", rows.length);

    // Insert in chunks
    const chunkSize = 100;

    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize).map(r => ({
            user_id: userId,
            imdb_id: r.imdb_id,
            status: r.status,
        }));

        const { error } = await supabase.from("movies").insert(chunk);

        if (error) {
            console.error("Batch insert failed:", error);
            console.error("Failed chunk:", chunk);
            process.exit(1);
        }

        console.log(`Inserted ${i + chunk.length} / ${rows.length}`);
    }

    console.log("Migration complete!");
    process.exit(0);
}

migrate();
