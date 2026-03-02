"use client";

import { notFound } from "next/navigation";
import { IncidentDetailPage } from "../../../_components/incidents/incident-detail-page";

interface MonitorIncidentDetailPageProps {
  params: { id?: string };
}

export default function MonitorIncidentDetailPage({
  params,
}: MonitorIncidentDetailPageProps) {
  const incidentId = Number(params?.id);

  if (!incidentId || Number.isNaN(incidentId)) {
    return notFound();
  }

  return (
    <IncidentDetailPage
      incidentId={incidentId}
      backHref="/monitor/incidents"
      mode="monitor"
    />
  );
}
