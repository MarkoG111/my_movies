import fs from "fs";

const tw = JSON.parse(fs.readFileSync("./src/data/toWatchFull.json"));
const w = JSON.parse(fs.readFileSync("./src/data/watchedFull.json"));

const dict = {};

for (const m of [...tw, ...w]) {
    dict[m.imdbId] = m;
}

fs.writeFileSync("./src/data/moviesDict.json", JSON.stringify(dict, null, 2));

console.log("movie dict built");
