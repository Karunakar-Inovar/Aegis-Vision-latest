import { STORAGE_KEYS, getItem, setItem } from "./storage";

export type IncidentAttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

export type PersistedIncident = {
  id: number;
  createdAt: string; // ISO string
  incidentType: string;
  severity: string;
  title: string;
  location: string;
  description: string;
  attachments: IncidentAttachmentMeta[];
};

export type AdminIncidentListItem = {
  id: number;
  type: string;
  severity: string;
  camera: string;
  pipeline: string;
  timestamp: string;
  status: string;
  confidence: number;
  thumbnail: null;
};

function coerceArray(value: unknown): PersistedIncident[] {
  if (!Array.isArray(value)) return [];
  return value as PersistedIncident[];
}

export function getPersistedIncidents(): PersistedIncident[] {
  return coerceArray(getItem<PersistedIncident[]>(STORAGE_KEYS.INCIDENTS));
}

export function getPersistedIncidentById(id: number): PersistedIncident | null {
  const incidents = getPersistedIncidents();
  return incidents.find((i) => i.id === id) ?? null;
}

export type CreatePersistedIncidentInput = Omit<
  PersistedIncident,
  "id" | "createdAt"
> & {
  id?: number;
  createdAt?: string;
};

export function addPersistedIncident(
  input: CreatePersistedIncidentInput
): PersistedIncident {
  const incidents = getPersistedIncidents();
  const incident: PersistedIncident = {
    id: input.id ?? Date.now(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    incidentType: input.incidentType,
    severity: input.severity,
    title: input.title,
    location: input.location,
    description: input.description,
    attachments: input.attachments ?? [],
  };

  setItem<PersistedIncident[]>(STORAGE_KEYS.INCIDENTS, [incident, ...incidents]);
  return incident;
}

export function mapPersistedIncidentToAdminListItem(
  incident: PersistedIncident
): AdminIncidentListItem {
  return {
    id: incident.id,
    type: incident.title,
    severity: incident.severity,
    camera: incident.location,
    pipeline: incident.incidentType,
    timestamp: new Date(incident.createdAt).toLocaleString(),
    status: "new",
    confidence: 100,
    thumbnail: null,
  };
}

export function getAdminIncidentListItemsFromStorage(): AdminIncidentListItem[] {
  return getPersistedIncidents().map(mapPersistedIncidentToAdminListItem);
}




