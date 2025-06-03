// this is the function that sends the magic link for people to log in

"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { isValidEmail } from "@/components/login/login-modal"; // or move this too

export function useMagicLogin({
  redirectToDashboard = false,
}: {
  redirectToDashboard?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const board = useMetadataStore((s) => s.board);

  const sendMagicLink = async () => {
    setLoading(true);
    setMessage("");

    if (email.trim() === "") {
      setMessage("Please enter an email address.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const baseUrl = window.location.origin;
    const redirectTo =
      board?.board_id && !redirectToDashboard
        ? `${baseUrl}/b/${board.board_id}`
        : `${baseUrl}/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Try again.");
    } else {
      setMessage("Check your email for a login link!");
    }

    setLoading(false);
  };

  return {
    email,
    setEmail,
    loading,
    message,
    sendMagicLink,
  };
}
