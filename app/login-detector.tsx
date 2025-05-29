"use client";
import { useUser } from "@/hooks/auth/use-user";

export default function LoginDetector() {
  useUser();
  return <></>;
}
