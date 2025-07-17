import { PositionedBlock } from "./sync-types";

export type UndoableAction = {
  do: () => void;
  undo: () => void;
  label: string;
  payload?: UndoPayload; // optional
};

export type UndoPayload = {
  positionedBlocks: PositionedBlock[];
};
