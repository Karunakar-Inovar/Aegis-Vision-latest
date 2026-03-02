"use client";

import { redirect } from "next/navigation";

export default function LegacyMonitorSummaryRedirect() {
  // Migration: old summary path -> new Shift Overview (/monitor/shift)
  redirect("/monitor/shift");
}
