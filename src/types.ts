export interface BugReview {
  line: string;
  issue: string;
  fix: string;
}

export interface SecurityReview {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  fix: string;
}

export interface PerformanceReview {
  issue: string;
  suggestion: string;
}

export interface ReviewResponse {
  bugs: BugReview[];
  security: SecurityReview[];
  performance: PerformanceReview[];
  rewritten_code: string;
  summary: string;
  mode?: "mock" | "live";
  message?: string;
  error_message?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  code: string;
  language: string;
  review: ReviewResponse;
}
