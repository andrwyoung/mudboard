// this component is the login modal that pops up
// we use a magic link and that logic is all in here too
// we want redirect to the board they're currently using

"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { InputDark } from "../ui/input-dark";
import { useMagicLogin } from "@/lib/db-actions/user/magic-link-login";
import InfoTooltip from "../ui/info-tooltip";

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginModal() {
  const { email, setEmail, loading, message, sendMagicLink } = useMagicLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sendMagicLink();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Login Button"
          className="w-full py-0.5 rounded-lg bg-background text-primary font-header text-sm
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
            <InfoTooltip text="We use password-free signups! Just enter your email and we'll send you a magic link. Clicking that link will sign you in instantly — no password needed." />
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
