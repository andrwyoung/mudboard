"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  createdAt: string;
  lastSeen: string;
  boards: number;
};

type Board = {
  id: string;
  name: string;
  userEmail: string;
  sections: number;
  images: number;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    // Replace with your actual DB fetch logic
    setUsers([
      {
        id: "1",
        email: "jane@example.com",
        createdAt: "2025-05-01",
        lastSeen: "2025-06-11",
        boards: 3,
      },
    ]);
    setBoards([
      {
        id: "a1",
        name: "Creature Designs",
        userEmail: "jane@example.com",
        sections: 4,
        images: 18,
      },
    ]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10 text-primary">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <section>
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
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Boards</h2>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Sections</th>
                <th className="text-left p-2">Images</th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board) => (
                <tr key={board.id} className="border-t">
                  <td className="p-2">{board.name}</td>
                  <td className="p-2">{board.userEmail}</td>
                  <td className="p-2">{board.sections}</td>
                  <td className="p-2">{board.images}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
