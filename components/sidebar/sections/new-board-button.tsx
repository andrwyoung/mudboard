// this component is the button you click to create a new board and then redirect to it

"use client";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import { NEW_BOARD_LINK } from "@/types/constants";

export default function NewBoardButton() {
  return (
    <Link
      href={NEW_BOARD_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-bold tracking-wide bg-transparent outline-2 outline-white text-off-white 
      hover:text-accent hover:outline-accent flex flex-row gap-1.5 items-center justify-center cursor-pointer
      rounded-md transition-all px-3 py-1 duration-300"
      title="Create a new Board"
      data-umami-event={`App: Create New Board`}
    >
      <FaPlus className="size-2" />
      Create Your Own!
    </Link>
  );
}
