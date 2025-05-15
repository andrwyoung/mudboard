import { Block } from "./block-types";

export type SectionColumns = Record<string, Block[][]>;

export type Section = {
  section_id: string;
  board_id: string;

  order_index?: number;
  title?: string;
};

export type Board = {
  board_id: string;
  title: string | null;

  user_id: string | null;
  password_hash: string | null;

  saved_column_num: number;
};
