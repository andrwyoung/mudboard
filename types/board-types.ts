// types for boards
// NOTE: look at types/supabase.ts because that's where we keep the database accurate types

import { Block } from "./block-types";
import { SectionStats } from "./stat-types";
import { Enums } from "./supabase";

export type CanvasScope = "main" | "mirror";

export type SectionColumns = Record<string, Block[][]>;
export type BoardAccessLevel =
  | "UNCLAIMED"
  | "CLAIMED_NOT_LOGGED_IN"
  | "CLAIMED_LOGGED_IN";

export type Section = {
  section_id: string;

  title?: string | null;
  description?: string | null;

  deleted: boolean;
  deleted_at?: Date;

  forked_from?: string;
  owned_by?: string;

  is_public: boolean | null;
  is_linkable: boolean | null;
  is_forkable: boolean | null;
  is_on_marketplace: boolean | null;
  first_published_at: Date;
  // shared_with: string[] ;

  saved_column_num: number;
  visualColumnNum: number; // DEPRECATED
};

export type BoardSection = {
  section: Section;
  board_section_id: string;
  board_id: string;
  order_index: number;

  deleted: boolean;
} & Partial<SectionStats>;

export type Board = {
  board_id: string;
  title: string | null;
  created_at: string;
  updated_at: string | null;

  user_id: string | null;
  password_hash: string | null;
  access_level: Enums<"access_type">;

  saved_column_num?: number;
  expired_at: string;
  is_demo: boolean;
};

export type User = {
  user_id: string;
  username: string | null;
  email: string | null;
};

// sections that belong to the user
export type UserBoardSection = {
  board_id: string;
  board_title: string | null;
  board_owner: string;
  order_index: number;
  section_id: string;
  section_title: string | null;
  forked_from?: string;
  saved_column_num: number;
  created_at: string;
} & SectionStats;
