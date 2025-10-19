"use client";

import { MAX_HISTORY } from "@/app/colors/lib/types/color-picker-constants";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface ColorHistoryItem {
  hex: string;
  timestamp: number;
}

export function useColorHistory() {
  const [colorHistory, setColorHistory] = useState<ColorHistoryItem[]>([]);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateColorHistory = useCallback((hex: string) => {
    // Clear any existing timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    // Debounce history updates
    historyTimeoutRef.current = setTimeout(() => {
      setColorHistory((prev) => {
        // Don't add if it's the same as the last color
        if (prev.length > 0 && prev[prev.length - 1].hex === hex) {
          return prev;
        }

        const newItem: ColorHistoryItem = {
          hex,
          timestamp: Date.now(),
        };

        const updated = [...prev, newItem];

        // Keep only the last maxHistory items
        if (updated.length > MAX_HISTORY) {
          return updated.slice(-MAX_HISTORY);
        }

        return updated;
      });
    }, 500); // 500ms debounce
  }, []);

  const clearHistory = useCallback(() => {
    setColorHistory([]);
    toast.success("Color history cleared");
  }, []);

  const removeFromHistory = useCallback((index: number) => {
    setColorHistory((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    toast.success("Color removed from history");
  }, []);

  const goToPreviousColor = useCallback(() => {
    if (colorHistory.length < 2) {
      toast.error("No previous color to go back to");
      return null;
    }

    const previousColor = colorHistory[colorHistory.length - 2];
    toast.success("Went back to previous color");
    return previousColor.hex;
  }, [colorHistory]);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
  }, []);

  return {
    colorHistory,
    updateColorHistory,
    clearHistory,
    removeFromHistory,
    goToPreviousColor,
    cleanup,
    historyCount: colorHistory.length,
    hasHistory: colorHistory.length > 0,
  };
}
