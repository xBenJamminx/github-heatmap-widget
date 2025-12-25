export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
  monthLabel?: string;
}

export interface ColorTheme {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}

export interface GitHubHeatmapProps {
  /** Your API endpoint URL (e.g., "/api/github-contributions" or "https://your-domain.com/api/github-contributions") */
  apiUrl: string;
  /** GitHub username to fetch contributions for */
  username: string;
  /** Number of weeks to display (default: 26, max: 53) */
  weeks?: number;
  /** Color theme for contribution levels */
  colorTheme?: ColorTheme;
  /** Size of each cell in pixels (default: 5) */
  cellSize?: number;
  /** Gap between cells in pixels (default: 1) */
  cellGap?: number;
  /** Show loading spinner (default: true) */
  showLoading?: boolean;
  /** Link to GitHub profile on click (default: true) */
  linkToProfile?: boolean;
  /** Custom class name for the container */
  className?: string;
}
