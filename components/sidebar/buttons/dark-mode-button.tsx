import { useUIStore } from "@/store/ui-store";
import { FaSun, FaMoon } from "react-icons/fa";

export default function DarkModeButton() {
  const darkMode = useUIStore((s) => s.darkMode);
  const setDarkMode = useUIStore((s) => s.setDarkMode);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-12 h-6 rounded-lg transition-colors duration-300
        flex items-center px-1.5 cursor-pointer ${
          darkMode ? "bg-slate-700" : "bg-yellow-400"
        }`}
      title="Toggle dark mode"
      aria-label="Toggle dark mode"
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300
          ${darkMode ? "translate-x-6" : "translate-x-0"}`}
      />
      <FaSun
        className={`text-xs z-10 transition-opacity ${
          darkMode ? "text-white" : "text-yellow-400"
        }`}
      />
      <FaMoon
        className={`text-xs z-10 ml-auto transition-opacity ${
          darkMode ? "text-slate-700" : "text-white"
        }`}
      />
    </button>
  );
}
