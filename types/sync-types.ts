import { Block } from "./block-types";

export type PositionedBlock = {
  block: Block;
  top: number;
  height: number;
  sectionId: string;
  colIndex: number;
  rowIndex: number;
  orderIndex: number; // for DB + forward/back nav
};
