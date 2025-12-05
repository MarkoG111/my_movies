export interface MovieHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;

  showFilters: boolean;
  setShowFilters: (value: boolean) => void;

  selectedGenre: string;
  setSelectedGenre: (value: string) => void;

  sortBy: string;
  setSortBy: (value: string) => void;

  allGenres: string[];

  onApplyFilters: () => void;

  toWatchCount: number;
  watchedCount: number;
}
