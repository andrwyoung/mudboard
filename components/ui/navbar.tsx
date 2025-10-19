"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { useMetadataStore } from "@/store/metadata-store";
import { DASHBOARD_LINK, DEMO_BOARD_LINK, LOGIN_LINK } from "@/types/constants";
import { ChevronDown } from "lucide-react";

interface NavbarProps {
  enforceHome?: boolean;
  color?: "white" | "brown";
}

export function Navbar({ enforceHome = true, color = "white" }: NavbarProps) {
  const user = useMetadataStore((s) => s.user);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div
      className={`z-12 flex flex-row justify-between items-center px-8 pt-3 pb-3 fixed top-0 w-screen  
        transition-colors duration-500  ${
          !scrolled
            ? "bg-transparent"
            : color === "white"
            ? "bg-primary/95 backdrop-blur-md"
            : "bg-off-white/60"
        }
      
      ${color === "white" ? "text-off-white" : "text-primary"}`}
    >
      <div
        className={`flex flex-row sm:gap-8 gap-4 items-center justify-center `}
      >
        <div className="">
          <Logo enforceHome={enforceHome} color={color} />
        </div>
        {/* Desktop navigation */}
        <div className="gap-6 items-center hidden lg:flex translate-y-1">
          <Link
            href="/colors"
            className="font-header font-bold hover:text-accent transition-colors duration-300"
          >
            Color Picker
          </Link>
          <Link
            href="/processing"
            className="font-header font-bold hover:text-accent transition-colors duration-300"
          >
            Image Converter
          </Link>
        </div>

        {/* Mobile dropdown */}
        <div className="relative lg:hidden dropdown-container">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="font-header text-lg cursor-pointer font-bold hover:text-accent 
            transition-colors duration-300 flex items-center gap-1 translate-y-1"
          >
            Tools
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg min-w-[200px] z-50 overflow-clip">
              <Link
                href="/colors"
                className="block px-4 py-2 text-sm text-primary font-header  hover:text-accent hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                Color Picker
              </Link>
              <Link
                href="/processing"
                className="block px-4 py-2 text-sm font-header text-primary hover:text-accent  hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                Image Converter
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 h-fit">
        {!user ? (
          <Link
            href={LOGIN_LINK}
            className={`flex gap-2  cursor-pointer items-center px-2 justify-center
              rounded-md text-md font-header font-bold transition-all duration-500
              ${
                color === "white"
                  ? "text-off-white   hover:text-accent "
                  : "text-primary   hover:text-accent  hover:border-accent"
              }
              `}
            data-umami-event={`Landing page: Login`}
          >
            Log In
          </Link>
        ) : (
          <Link
            href={DASHBOARD_LINK}
            data-umami-event={`Landing page: Dashboard`}
            className={`flex gap-2  cursor-pointer items-center px-2 justify-center
              rounded-md text-md font-header font-bold transition-all duration-500
            
              ${
                color === "white"
                  ? "text-off-white   hover:text-accent "
                  : "text-primary   hover:text-accent  hover:border-accent"
              }
              `}
          >
            My Boards
          </Link>
        )}
        <Link
          href={DEMO_BOARD_LINK}
          data-umami-event={`Landing page: Demo Board Navbar`}
          className={`hidden sm:flex gap-2  cursor-pointer items-center px-3 border-2 border-accent bg-accent justify-center
              rounded-md text-primary text-lg font-header transition-all duration-500
              hover:text-off-white hover:bg-accent/90 
              `}
        >
          Demo
        </Link>
      </div>
    </div>
  );
}
