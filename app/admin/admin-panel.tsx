"use client";

import { CopyToClipboard } from "@/components/ui/click-to-copy";
import { Tables } from "@/types/supabase";
import { buildMudboardLink } from "@/utils/build-mudboard-link";
import { supabase } from "@/lib/supabase/supabase-client";
import React from "react";
import { useEffect, useState } from "react";

type FullBoard = Tables<"boards"> & {
  board_sections: {
    section_id: string;
    order_index: number;
    section: Tables<"sections"> | null;
  }[];
  section_count: number;
  block_count: number;
  image_count: number;
  real_block_count: number;
};

// type FullBlock = Tables<"blocks"> & {
//   image?: {
//     image_id: string;
//     file_ext: string;
//   };
// };

export default function AdminPanel() {
  const [boards, setBoards] = useState<FullBoard[]>([]);
  // const [blocks, setBlocks] = useState<FullBlock[]>([]);

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

      const { data: statsData, error: statsErr } = await supabase
        .from("board_stats")
        .select("*");

      // const { data: blockData, error: blockErr } = await supabase.from("blocks")
      //   .select(`
      //   *,
      //   image:images (
      //     image_id,
      //     file_ext
      //   )
      // `);

      if (boardErr || statsErr) {
        console.error("Error fetching admin data", boardErr, statsErr);
        return;
      }

      const boardsWithStats = (boardData || [])
        .map((board) => {
          const stats = statsData?.find((s) => s.board_id === board.board_id);
          return {
            ...board,
            section_count: stats?.section_count ?? 0,
            block_count: stats?.block_count ?? 0,
            image_count: stats?.image_count ?? 0,
            real_block_count: stats?.real_block_count ?? 0,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setBoards(boardsWithStats);
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
               cursor-pointer text-primary-text transition-all duration-200"
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
                <th className="text-left p-2">Block Data</th>
                <th className="text-left p-2">Created (PST)</th>
                <th className="text-left p-2">Columns</th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board) => {
                const isExpanded = expandedBoards.includes(board.board_id);
                const isExpired =
                  !board.user_id &&
                  new Date().getTime() - new Date(board.created_at).getTime() >
                    7 * 24 * 60 * 60 * 1000;

                return (
                  <React.Fragment key={board.board_id}>
                    <tr
                      className={`border-t text-xs cursor-pointer hover:bg-gray-50 ${
                        isExpanded
                          ? "bg-gray-100"
                          : isExpired || board.deleted
                          ? "bg-rose-50"
                          : "primary-foreground"
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
                          link={buildMudboardLink(board.board_id)}
                        >
                          <span className="inline-block max-w-[96px] truncate align-bottom">
                            {board.board_id}
                          </span>
                        </CopyToClipboard>
                      </td>
                      <td className="p-2">{board.section_count}</td>
                      <td
                        className="p-2"
                        title={`Live: ${board.block_count}, Images: ${
                          board.image_count
                        }, Deleted: ${
                          board.real_block_count - board.block_count
                        }`}
                      >
                        {board.block_count}, {board.image_count},{" "}
                        {board.real_block_count - board.block_count}
                      </td>
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

                            // const blocksInSection = blocks.filter(
                            //   (b) =>
                            //     b.section_id ===
                            //     "093cf010-e4fa-445e-9b31-4ed0b8231b6c"
                            // );

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
                                    title="Click to copy Section ID"
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
                                  <span className="ml-2  text-xs truncate min-w-[64px]">
                                    {sec.forked_from ? (
                                      <CopyToClipboard
                                        textToCopy={sec.section_id}
                                        title="Click to copy Section ID"
                                      >
                                        forked: {sec.forked_from}
                                      </CopyToClipboard>
                                    ) : (
                                      "None"
                                    )}
                                  </span>
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

{
  /* <div className="pl-5 text-xs mt-1 text-gray-600 gap-0.5">
{blocksInSection.map((block) => (
  <div
    key={block.block_id}
    className={`grid grid-cols-[64px_1fr] gap-2 ${
      block.deleted ? "bg-rose-100" : ""
    }`}
  >
    <p>{block.block_type}</p>
    {/* <p>{block.deleted ? "deleted" : ""}</p> */
}
// <CopyToClipboard
//   textToCopy={block.block_id}
//   title="Click to copy Block ID"
//   link={
//     block.block_type === "image" &&
//     block.image
//       ? getImageUrl(
//           block.image.image_id,
//           block.image.file_ext,
//           "full"
//         )
//       : undefined
//   }
// >
//   {block.block_id}
// </CopyToClipboard>
//   </div>
// ))}
// {blocksInSection.length === 0 && (
//   <div className="italic text-gray-400">
//     No blocks
//   </div>
// )}
{
  /* </div> */
}
