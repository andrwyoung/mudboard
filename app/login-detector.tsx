// this here just so we can attach the useUser() hook to layout.tsx
// to listen for login/logouts

"use client";
import { useUser } from "@/hooks/auth/use-user";

export default function LoginDetector() {
  useUser();
  return <></>;
}
