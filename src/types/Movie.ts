import { MovieBase } from "./MovieBase";

export interface Movie extends MovieBase {
    status: "toWatch" | "watched";
}

export type MovieDictionary = {
    [imdbId: string]: MovieBase;
};
