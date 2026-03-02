import { redirect } from "next/navigation";

export default function LegacyPipelinesRedirect() {
  // Migration: legacy pipelines path -> /monitor/areas
  redirect("/monitor/areas");
}
