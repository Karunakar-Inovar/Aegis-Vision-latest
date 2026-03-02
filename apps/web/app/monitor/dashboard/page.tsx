"use client";

import { redirect } from "next/navigation";

export default function LegacyMonitorDashboardRedirect() {
  // Migration: old dashboard path -> new Live Monitoring (/monitor/live)
  redirect("/monitor/live");
}
