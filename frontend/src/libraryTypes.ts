import type { Chapter } from "./videoDetails";
export type VideoItem = {
  source?: string;
  id: number;
  title: string;
  author: string;
  views: string;
  date: string;
  duration: string;
  image: string;
  category: string;
  progress?: number;
  privacy?: "Публичное" | "Приватное" | "По приглашению";
  size?: string;
};

export type Clip = VideoItem & {
  qualityAvailable?: boolean;
  chapters?: Chapter[];
  seconds?: number;
  coverMode?: "auto" | "custom";
  owner: string;
  tags: string[];
  invites: string[];
  folder: string;
  local?: boolean;
};
export type Account = {
  interests?: string[];
  id: string;
  name: string;
  email: string;
};
export type Group = {
  description?: string;
  visibility?: string;
  id: string;
  name: string;
  items: number[];
  kind: string;
  owner: string;
};
export type Visit = { user: string; id: number; time: number; duration: number; date: number };
export type Note = { authorId?: string; key?: string; user: string; text: string; id: number };
export type ChannelPost = { id: string; owner: string; text: string; date: number };
export type Model = {
  studioCatalog?: boolean;
  posts: ChannelPost[];
  branding: Record<string, { avatar?: string; banner?: string }>;
  accounts: Account[];
  clips: Clip[];
  groups: Group[];
  folders: Record<string, string[]>;
  saved: string[];
  dislikes: string[];
  likes: string[];
  follows: string[];
  comments: Note[];
  visits: Visit[];
  jobs: Record<number, string>;
  notices: Record<string, string[]>;
  chat: string[];
};
export type ServerState = { user: string; version: number; model: Model };
