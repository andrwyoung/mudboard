// this it the full login page. after successful login here, they're redirected to /dashboard
// note that login-modal.tsx contains the popup login
// modal for if they want to log in on the spot

"use client";
import { useMagicLogin } from "@/lib/db-actions/user/magic-link-login";
import { InputDark } from "@/components/ui/input-dark";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { email, setEmail, loading, message, sendMagicLink } = useMagicLogin({
    redirectToDashboard: true,
  });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMagicLink();
  };

  useEffect(() => {
    // check if they're logged in already
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        router.replace("/dashboard");
      }
    };

    checkSession();

    // listener to see if logged in on another tab when already opened
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary text-primary p-6 relative">
      {/* Logo in top-left */}
      <div className="absolute top-4 left-6">
        <Logo />
      </div>

      {/* Login Card */}
      <div className="max-w-lg w-full bg-background p-8 rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-2">Sign in to Mudboard</h1>
        <p className="text-sm mb-6">
          Enter your email address and we’ll send you a magic link to sign in
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputDark
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            className="p-2"
            autoFocus
          />
          <Button type="submit" disabled={loading} className="py-2 font-header">
            {loading ? "Sending Magic Link..." : "Send Magic Link"}
          </Button>
          {message && (
            <p className="text-sm text-primary self-center text-center">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
