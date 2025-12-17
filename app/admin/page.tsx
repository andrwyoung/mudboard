"use client";
import { useMetadataStore } from "@/store/metadata-store";
import React from "react";
import AdminPanel from "./admin-panel-v2";
import NotFoundComponent from "@/components/not-found-page";

export default function AdminPage() {
  const profile = useMetadataStore((s) => s.profile);

  return (
    <>
      {profile && profile.role === "admin" ? (
        <AdminPanel />
      ) : (
        <NotFoundComponent />
      )}
    </>
  );
}
