import { redirect } from "next/navigation";

export default function LegacyAlertRedirect() {
  // Migration: legacy alert path -> /monitor/alerts
  redirect("/monitor/alerts");
}
