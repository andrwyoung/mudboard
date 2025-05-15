import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const board = await createNewBoard({});
    return NextResponse.json({ board_id: board.board_id });
  } catch (error) {
    console.error("Board creation failed:", error);
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}