import { Block } from "./block-types";

export type SectionColumns = Record<string, Block[][]>;
export type BoardAccessLevel =
  | "UNCLAIMED"
  | "CLAIMED_NOT_LOGGED_IN"
  | "CLAIMED_LOGGED_IN";

export type Section = {
  section_id: string;
  board_id: string;

  order_index?: number;
  title?: string | null;
  description?: string | null;
};

export type Board = {
  board_id: string;
  title: string | null;

  user_id: string | null;
  password_hash: string | null;

  saved_column_num: number;
};

export type User = {
  user_id: string;
  username: string | null;
  email: string | null;
};
