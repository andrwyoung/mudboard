import { verifyPassword } from "@/lib/auth/encrypt-decrypt";
import { getBoardPassword } from "@/lib/auth/save-get-password";
import { Board, BoardAccessLevel, Section } from "@/types/board-types";
import { create } from "zustand";
import { UserProfile } from "./user-store";
import { User } from "@supabase/supabase-js";

type MetadataStore = {
  board: Board | null;
  setBoard: (board: Board) => void;

  user: User | null | undefined;
  setUser: (user: User | null) => void;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;

  accessLevel: BoardAccessLevel;
  setAccessLevel: (level: BoardAccessLevel) => void;
  getAndSyncAccessLevel: () => Promise<BoardAccessLevel>;

  sections: Section[];
  setSections: (section: Section[]) => void;
};

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  board: null,
  setBoard: (board: Board) => set({ board }),

  user: undefined,
  setUser: (user) => set({ user }),
  profile: null,
  setProfile: (profile) => set({ profile }),

  accessLevel: "UNCLAIMED",
  setAccessLevel: (accessLevel: BoardAccessLevel) => set({ accessLevel }),
  getAndSyncAccessLevel: async () => {
    const board = get().board;
    const setAccessLevel = get().setAccessLevel;

    if (!board) {
      setAccessLevel("UNCLAIMED");
      return "UNCLAIMED";
    }

    const isClaimed = Boolean(board.password_hash || board.user_id);
    if (!isClaimed) {
      setAccessLevel("UNCLAIMED");
      return "UNCLAIMED";
    }

    const password = getBoardPassword(board.board_id);
    if (!password) {
      setAccessLevel("CLAIMED_NOT_LOGGED_IN");
      return "CLAIMED_NOT_LOGGED_IN";
    }

    const valid = await verifyPassword(password, board.password_hash!);
    const level = valid ? "CLAIMED_LOGGED_IN" : "CLAIMED_NOT_LOGGED_IN";
    setAccessLevel(level);
    return level;
  },

  sections: [] as Section[],
  setSections: (sections: Section[]) => set({ sections }),
}));
