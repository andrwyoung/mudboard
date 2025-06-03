// when boards are expired, we show this overlay

import { NEW_BOARD_LINK } from "@/types/constants";
import Link from "next/link";

export default function BoardExpiredPopup() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-8 text-center z-100 bg-slate-700/80">
      <h1 className="text-3xl font-bold ">This board has expired</h1>
      <p className="text-white  mb-6">This board is no longer available</p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex bg-accent text-primary-darker px-4 py-2 rounded-lg font-semibold
          font-header hover:bg-white hover:text-primary transition-all duration-300"
        >
          Go Home
        </Link>
        <Link
          href={NEW_BOARD_LINK}
          className="border-2 border-accent text-accent px-4 py-1.5 rounded-lg font-semibold
          font-header hover:border-white hover:text-white transition-all duration-300"
        >
          Create New Board
        </Link>
      </div>
    </div>
  );
}
