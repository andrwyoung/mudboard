"use client";

import { supabase } from "@/lib/supabase/supabase-client";
import React from "react";
import { useEffect, useState } from "react";
import StatChart from "./graphing/stat-chart";
import BoardStatChart from "./graphing/board-stat-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DailyStat = {
  date: string;
  count: number;
};

export type BoardDailyStat = {
  date: string;
  total: number;
  demos: number;
  uniqueUsers?: number;
};

export default function AdminPanel() {
  const [boardStats, setBoardStats] = useState<BoardDailyStat[]>([]);
  const [imageStats, setImageStats] = useState<DailyStat[]>([]);
  const [days, setDays] = useState<number>(14);

  function groupByDay(rows: { created_at: string }[]): DailyStat[] {
    const map = new Map<string, number>();

    rows.forEach((r) => {
      const day = r.created_at.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    });

    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function groupBoardsByDay(
    rows: { created_at: string; is_demo: boolean; user_id: string | null }[]
  ): BoardDailyStat[] {
    const map = new Map<
      string,
      { total: number; demos: number; userIds: Set<string> }
    >();

    rows.forEach((r) => {
      const day = r.created_at.slice(0, 10);

      if (!map.has(day)) {
        map.set(day, { total: 0, demos: 0, userIds: new Set() });
      }

      const entry = map.get(day)!;
      entry.total += 1;
      if (r.is_demo) entry.demos += 1;
      if (r.user_id) {
        entry.userIds.add(r.user_id);
      }
    });

    return Array.from(map.entries())
      .map(([date, counts]) => ({
        date,
        total: counts.total,
        demos: counts.demos,
        uniqueUsers: counts.userIds.size > 0 ? counts.userIds.size : undefined,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  useEffect(() => {
    const fetchStats = async () => {
      const { data: boards } = await supabase
        .from("boards")
        .select("created_at, is_demo, user_id")
        .gte("created_at", new Date(Date.now() - days * 864e5).toISOString());

      const { data: images } = await supabase
        .from("images")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - days * 864e5).toISOString());

      setBoardStats(groupBoardsByDay(boards ?? []));
      setImageStats(groupByDay(images ?? []));
    };

    fetchStats();
  }, [days]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10 text-primary">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="days-select" className="text-sm">
            Show last:
          </label>
          <Select
            value={days.toString()}
            onValueChange={(value) => setDays(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <section className="space-y-6">
        <BoardStatChart
          title={`Boards created (last ${days} days)`}
          data={boardStats}
        />
        <StatChart
          title={`Images uploaded (last ${days} days)`}
          data={imageStats}
        />
      </section>
    </div>
  );
}
