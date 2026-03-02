import { redirect } from "next/navigation";

export default function ShiftOverviewRedirect() {
  redirect("/monitor/summary");
}
