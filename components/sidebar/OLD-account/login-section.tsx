import React from "react";
import { Board } from "@/types/board-types";
import { verifyPassword } from "@/lib/auth/encrypt-decrypt";
import { saveBoardPassword } from "@/lib/auth/save-get-password";
import { toast } from "sonner";
import { useMetadataStore } from "@/store/metadata-store";
import PasswordForm from "../../ui/password";

export default function OLDLoginSection({ board }: { board: Board }) {
  async function handleLogin(password: string) {
    if (!board || !board.password_hash) return;

    const accessLevel = await useMetadataStore
      .getState()
      .getAndSyncAccessLevel?.();

    if (accessLevel === "CLAIMED_LOGGED_IN") {
      toast.success("Already Logged In");
      return;
    }

    const success = await verifyPassword(password, board.password_hash);
    if (!success) {
      toast.error("Incorrect password");
      return;
    }

    if (!board.user_id) {
      toast.error("Board has no user associated with it.");
      return;
    }

    try {
      // const user = await fetchSupabaseUser(board.user_id);
      // setUser(user);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch user.");
      return;
    }

    saveBoardPassword(board.board_id, password);
    toast.success("Logged in successfully!");
  }

  return (
    <PasswordForm
      buttonLabel="Login"
      onSubmit={(password) => handleLogin(password)}
    />
  );
}
