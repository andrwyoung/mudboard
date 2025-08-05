import { Board, Section } from "./board-types";

export type BoardStats = {
  board_id: string;

  // note that all of these stats filter out DELETED board_sections and sections
  section_count: number; // NOT DELETED sections that are connected to this board via NOT DELETED board_sections
  real_block_count: number; // ALL blocks in the linked sections, regardless of deleted status
  block_count: number; // NOT DELETED blocks in all board_sections
  image_count: number; // NOT DELETED image blocks

  mudkit_count: number; // number of section that is_public
};

export type SectionStats = {
  section_id?: string;

  block_count?: number; // how many NOT DELETED blocks are in here
  saved_column_num?: number;
  is_shared?: boolean; // is_public AND is_on_marketplace
  ss_is_public?: boolean; // is_public (but we keep another copy around for fun)
  shallow_copy_count?: number; // how many TOTAL NOT DELETED board_sections refer to this one (including your own). we display this if shared == true
  personal_copy_count?: number; // subset of shallow_copy_count. How many times YOU use this section internally
  fork_count?: number; // how many other sections were copied from this one

  username?: string;
};

export type SectionWithStats = Section & SectionStats;
export type SectionWithStatsAndBoardInfo = SectionWithStats & {
  board_id: string;
  board_title?: string | null;
  order_index: number;
  board_created_at: string;
};

export type BoardWithStats = Board & BoardStats;
