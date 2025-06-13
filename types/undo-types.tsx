import { PositionedBlock } from "./sync-types";

export type UndoableAction = {
  do: () => void;
  undo: () => void;
  label: string;
  payload?: UndoPayload;
};

export type UndoPayload = {
  positionedBlocks: PositionedBlock[];
};
