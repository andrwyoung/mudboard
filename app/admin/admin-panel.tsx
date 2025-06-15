"use client";

import { CopyToClipboard } from "@/components/ui/click-to-copy";
import { Tables } from "@/types/supabase";
import { supabase } from "@/utils/supabase";
import React from "react";
import { useEffect, useState } from "react";

type FullBoard = Tables<"boards"> & {
  board_sections: (Tables<"board_sections"> & {
    section: Tables<"sections"> | null;
  })[];
};

export default function AdminPanel() {
  const [boards, setBoards] = useState<FullBoard[]>([]);
  const [blocks, setBlocks] = useState<Tables<"blocks">[]>([]);

  const [expandedBoards, setExpandedBoards] = useState<string[]>([]);

  const toggleExpand = (boardId: string) => {
    setExpandedBoards((prev) =>
      prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId]
    );
  };

  useEffect(() => {
    const initData = async () => {
      const { data: boardData, error: boardErr } = await supabase.from("boards")
        .select(`
        *,
        board_sections (
          *,
          section:sections (*)
        )
      `);

      const { data: blockData, error: blockErr } = await supabase
        .from("blocks")
        .select("*");

      if (boardErr || blockErr) {
        console.error("Error fetching admin data", boardErr, blockErr);
        return;
      }

      const sortedBoards = (boardData || []).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setBoards(sortedBoards);
      setBlocks(blockData || []);
    };

    initData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10 text-primary">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* <section>
        <h2 className="text-lg font-semibold mb-2">Users</h2>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Last Seen</th>
                <th className="text-left p-2">Boards</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.createdAt}</td>
                  <td className="p-2">{user.lastSeen}</td>
                  <td className="p-2">{user.boards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section> */}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold ">Boards {boards.length}</h2>
          <button
            type="button"
            title="Collapse all expanded boards"
            className="px-2 py-1 rounded-lg text-xs bg-primary hover:bg-accent font-header 
               cursor-pointer text-white transition-all duration-200"
            onClick={() => setExpandedBoards([])}
          >
            Collapse All
          </button>
        </div>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">User Id</th>
                <th className="text-left p-2">Board Id</th>
                <th className="text-left p-2">Sections</th>
                <th className="text-left p-2">Images</th>
                <th className="text-left p-2">Created (PST)</th>
                <th className="text-left p-2">Columns</th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board) => {
                const sectionCount = board.board_sections.length;
                const blockCount = board.board_sections.reduce((sum, bs) => {
                  const id = bs.section?.section_id;
                  return sum + blocks.filter((b) => b.section_id === id).length;
                }, 0);

                const isExpanded = expandedBoards.includes(board.board_id);

                return (
                  <React.Fragment key={board.board_id}>
                    <tr
                      className={`border-t text-xs cursor-pointer hover:bg-gray-50 ${
                        isExpanded
                          ? "bg-gray-100"
                          : !board.user_id &&
                            new Date().getTime() -
                              new Date(board.created_at).getTime() >
                              7 * 24 * 60 * 60 * 1000
                          ? "bg-rose-50"
                          : "bg-white"
                      }`}
                      onClick={() => toggleExpand(board.board_id)}
                    >
                      <td className="p-2 font-medium">
                        <button
                          className="text-primary hover:text-secondary hover:underline cursor-pointer
                          transition-all duration-300"
                        >
                          {board.title ?? "__UNNAMED__"}
                        </button>
                      </td>
                      <td>
                        <CopyToClipboard
                          textToCopy={board.user_id ?? ""}
                          title="Click to copy User ID"
                        >
                          <span className="inline-block max-w-[96px] truncate align-bottom">
                            {board.user_id ?? "unclaimed"}
                          </span>
                        </CopyToClipboard>
                      </td>
                      <td>
                        <CopyToClipboard
                          textToCopy={board.board_id}
                          title="Click to copy Board ID"
                        >
                          <span className="inline-block max-w-[96px] truncate align-bottom">
                            {board.board_id}
                          </span>
                        </CopyToClipboard>
                      </td>
                      <td className="p-2">{sectionCount}</td>
                      <td className="p-2">{blockCount}</td>
                      <td className="p-2">
                        {(() => {
                          const d = new Date(board.created_at);
                          return `${d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "2-digit",
                            timeZone: "America/Los_Angeles",
                          })} • ${d.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "America/Los_Angeles",
                          })}`;
                        })()}
                      </td>
                      <td className="p-2">{board.saved_column_num ?? "—"}</td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 p-4 text-sm">
                          {board.board_sections.map((bs) => {
                            const sec = bs.section;
                            if (!sec)
                              return (
                                <p key={bs.section_id}>⚠️ Missing section</p>
                              );

                            const blocksInSection = blocks.filter(
                              (b) => b.section_id === sec.section_id
                            );

                            return (
                              <div key={sec.section_id} className="mb-4">
                                <div className="flex flex-row items-center gap-4 ">
                                  <span
                                    className="mr-2 text-primary font-header rounded-full 
                                  text-xs font-bold "
                                  >
                                    {bs.order_index}
                                  </span>
                                  <div className="font-semibold font-header min-w-64">
                                    {sec.title ?? "__UNNAMED__"}
                                  </div>

                                  <CopyToClipboard
                                    textToCopy={sec.section_id}
                                    title="Click to copy User ID"
                                  >
                                    <span className="inline-block max-w-[96px] truncate align-bottom">
                                      {sec.section_id}
                                    </span>
                                  </CopyToClipboard>

                                  {sec.deleted && (
                                    <span className="ml-2 text-red-500 text-xs">
                                      (deleted)
                                    </span>
                                  )}
                                  {sec.forked_from && (
                                    <span className="ml-2 text-yellow-600 text-xs">
                                      forked from {sec.forked_from}
                                    </span>
                                  )}
                                </div>
                                <div className="pl-5 text-xs mt-1 text-gray-600 gap-0.5">
                                  {blocksInSection.map((block) => (
                                    <div
                                      key={block.block_id}
                                      className="grid grid-cols-[64px_1fr] gap-2"
                                    >
                                      <p>{block.block_type}</p>{" "}
                                      <p>{block.block_id}</p>
                                    </div>
                                  ))}
                                  {blocksInSection.length === 0 && (
                                    <div className="italic text-gray-400">
                                      No blocks
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
