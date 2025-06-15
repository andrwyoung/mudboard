"use client";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  textToCopy: string;
  children: React.ReactNode;
  title?: string;
};

export function CopyToClipboard({ textToCopy, children, title }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Successfully copied ID");
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <span
      className="cursor-pointer p-2 hover:text-secondary transition text-xs text-primary w-full"
      onClick={handleCopy}
      title={copied ? "Copied!" : title ?? "Click to copy"}
    >
      {children}
    </span>
  );
}
