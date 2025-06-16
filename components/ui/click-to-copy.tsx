"use client";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  textToCopy: string;
  children: React.ReactNode;
  title?: string;
  link?: string;
};

export function CopyToClipboard({ textToCopy, children, title, link }: Props) {
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
      className={`cursor-pointer  text-xs text-primary w-full ${
        link ? "hover:text-accent" : "hover:text-secondary"
      }`}
      onClick={handleCopy}
      title={copied ? "Copied!" : title ?? "Click to copy"}
      onContextMenu={(e) => {
        if (!e.metaKey && !e.ctrlKey && link) {
          e.preventDefault();
          window.open(link, "_blank");
        }
      }}
    >
      {children}
    </span>
  );
}
