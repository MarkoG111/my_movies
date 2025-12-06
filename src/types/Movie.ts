export interface Movie {
  imdbId: string;
  title: string;
  year: number;
  runtime: number;
  genres: string[];
  rating: number;
  poster: string;
  status: "toWatch" | "watched";
}
