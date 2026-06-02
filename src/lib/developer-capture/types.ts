export type CaptureSide = "left" | "right";

export interface CapturePlayerConfig {
  side: CaptureSide;
  label: string;
  githubUrl: string;
  authors: string[];
}

export interface CaptureConfig {
  repositoryPath: string;
  statePath: string;
  targetRepositoryUrl: string;
  targetRepositoryOwnerSide: CaptureSide;
  players: [CapturePlayerConfig, CapturePlayerConfig];
}

export interface CapturePlayerStats {
  side: CaptureSide;
  label: string;
  githubUrl: string;
  score: number;
  percent: number;
  commits: number;
  additions: number;
  deletions: number;
}

export interface CaptureState {
  date: string;
  timezone: "Asia/Taipei";
  updatedAt: string;
  repositoryPath: string;
  targetRepositoryUrl: string;
  targetRepositoryOwnerSide: CaptureSide;
  players: [CapturePlayerStats, CapturePlayerStats];
  status: "ready" | "neutral" | "missing-config" | "git-error";
  message: string;
}

export interface GitAuthorStats {
  name: string;
  email: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface RawCommitStats {
  authorName: string;
  authorEmail: string;
  additions: number;
  deletions: number;
}
