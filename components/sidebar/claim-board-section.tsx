import { useMetadataStore, useUserStore } from "@/store/metadata-store";
import React from "react";
import { hashPassword } from "@/lib/auth/encrypt-decrypt";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { saveBoardPassword } from "@/lib/auth/save-get-password";
import { Board } from "@/types/board-types";
import PasswordForm from "../ui/password";

export default function ClaimBoardSection({ board }: { board: Board }) {
  const setBoard = useMetadataStore((s) => s.setBoard);
  const setUser = useUserStore((s) => s.setUser);

  async function claimBoard(password: string) {
    if (!board) return;
    const accessLevel = await useMetadataStore
      .getState()
      .getAndSyncAccessLevel?.();
    if (accessLevel != "UNCLAIMED") {
      toast.error("Board already claimed!");
      return;
    }

    try {
      const passwordHash = await hashPassword(password);

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({})
        .select()
        .single();

      if (userError || !user) {
        throw new Error("Failed to create user: " + userError?.message);
      }

      const { error: boardError } = await supabase
        .from("boards")
        .update({ password_hash: passwordHash, user_id: user.user_id })
        .eq("board_id", board.board_id);

      if (boardError) {
        throw new Error("Failed to claim board: " + boardError?.message);
      }

      // update the local board
      setBoard({
        ...board,
        password_hash: passwordHash,
        user_id: user.user_id,
      });
      setUser(user);
      // save the password locally so it's persistant
      saveBoardPassword(board.board_id, password);

      toast.success("Successfully claimed board!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to claim board. Please try again");
    }
  }

  return (
    <PasswordForm
      placeholder="Create a Password"
      buttonLabel="Claim!"
      onSubmit={(password) => claimBoard(password)}
    />
  );
}
