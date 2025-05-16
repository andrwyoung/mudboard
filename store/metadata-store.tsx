import { verifyPassword } from "@/lib/auth/encrypt-decrypt";
import { getBoardPassword } from "@/lib/auth/save-get-password";
import { Board, BoardAccessLevel, Section, User } from "@/types/board-types";
import { create } from "zustand";

type MetadataStore = {
  board: Board | null;
  setBoard: (board: Board) => void;

  accessLevel: BoardAccessLevel;
  setAccessLevel: (level: BoardAccessLevel) => void;
  getAndSyncAccessLevel: () => Promise<BoardAccessLevel>;

  sections: Section[];
  setSections: (section: Section[]) => void;
};

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  board: null,
  setBoard: (board: Board) => set({ board }),

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

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
};
export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
}));
