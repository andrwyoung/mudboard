"use client";

import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa6";

interface ScrollToTopProps {
  threshold?: number; // pixels to scroll before showing button
  className?: string;
}

export default function ScrollToTop({
  threshold = 100,
  className = "",
}: ScrollToTopProps) {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > threshold);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!showScrollToTop) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <button
        onClick={scrollToTop}
        className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/80 transition-colors duration-200"
        title="Go to top"
      >
        <FaArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
