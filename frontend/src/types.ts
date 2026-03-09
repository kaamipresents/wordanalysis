export interface KeywordDensityItem {
  word: string;
  count: number;
  density: number;
}

export interface AnalyticsResult {
  word_count: number;
  char_count_spaces: number;
  char_count_no_spaces: number;
  sentence_count: number;
  paragraph_count: number;
  reading_time_mins: number;
  speaking_time_mins: number;
  keyword_density: KeywordDensityItem[];
}

export const defaultAnalytics: AnalyticsResult = {
  word_count: 0,
  char_count_spaces: 0,
  char_count_no_spaces: 0,
  sentence_count: 0,
  paragraph_count: 0,
  reading_time_mins: 0,
  speaking_time_mins: 0,
  keyword_density: [],
};
