"use client";

import { useParams } from "next/navigation";
import { IncidentDetailPage } from "../../../_components/incidents/incident-detail-page";

export default function AdminIncidentDetailRoute() {
  const params = useParams<{ id?: string }>();
  const idParam = params?.id;
  const incidentId = typeof idParam === "string" ? Number(idParam) : Number.NaN;

  if (!idParam || Number.isNaN(incidentId)) {
    return null;
  }

  return (
    <IncidentDetailPage
      incidentId={incidentId}
      backHref="/admin/incidents"
      mode="admin"
    />
  );
}


