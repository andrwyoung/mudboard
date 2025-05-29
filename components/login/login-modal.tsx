import { supabase } from "@/utils/supabase";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { InputDark } from "../ui/input-dark";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { FaQuestionCircle } from "react-icons/fa";

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email.trim() === "") {
      setMessage("Please Enter an email address");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Please Enter a Valid Email Address");
      setLoading(false);
      return;
    }

    // now send the email
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage("Something went wrong. Try again.");
      console.log("Signup Error: ", error);
    } else {
      setMessage("Check your email for a login link!");
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Login Button"
          className="w-full py-0.5 rounded-lg bg-white text-primary font-header text-sm
             cursor-pointer hover:bg-accent transition-all duration-200"
        >
          Log In
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-md bg-background p-6 shadow-lg max-w-md w-full">
        <DialogTitle className="text-2xl text-primary">
          Sign in to Mudboard
          <div className="flex flex-row gap-1 text-xs items-center text-primary pt-1.5">
            We&apos;ll email you a magic link.
            <Tooltip>
              <TooltipTrigger asChild>
                <FaQuestionCircle className="size-3.5 text-primary translate-y-[1px]" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                We use password-free signups! Just enter your email and
                we&apos;ll send you a magic link. Clicking that link will sign
                you in instantly — no password needed.
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogTitle>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 pt-4 pb-2">
          <div>
            {/* <h3 className="select-none px-2 text-primary pb-1">
              Email Address:
            </h3> */}
            <InputDark
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              className="p-2"
            />{" "}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="font-header py-2"
            >
              {loading ? "Sending Magic Link..." : "Send Magic Link"}
            </Button>
            {message && (
              <p className="text-sm text-primary self-center">{message}</p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
