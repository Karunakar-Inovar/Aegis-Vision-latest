'use client';

import '@crayonai/react-ui/styles/index.css';
import { useEffect, useState } from 'react';
import { C1Component, ThemeProvider } from '@thesysai/genui-sdk';

export interface Alert {
  alertId: string;
  cameraId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  timestamp: string;
  thumbnailUrl?: string;
  description: string;
  location?: string;
}

interface AlertOverlayProps {
  alert: Alert;
}

const SEVERITY_COLORS: Record<Alert['severity'], string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#3B82F6',
};

function SkeletonLoader() {
  return (
    <div className="alert-overlay-skeleton" style={skeletonStyles.wrapper}>
      <div style={skeletonStyles.badge} />
      <div style={skeletonStyles.titleLine} />
      <div style={skeletonStyles.bodyLine} />
      <div style={skeletonStyles.bodyLineShort} />
      <div style={skeletonStyles.buttonRow}>
        <div style={skeletonStyles.button} />
        <div style={skeletonStyles.button} />
        <div style={skeletonStyles.button} />
      </div>
      <style>{`
        @keyframes alert-skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .alert-overlay-skeleton > div {
          animation: alert-skeleton-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const skeletonStyles = {
  wrapper: {
    padding: 16,
    borderRadius: 8,
    background: '#111827',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  badge: {
    width: 72,
    height: 22,
    borderRadius: 4,
    background: '#374151',
  },
  titleLine: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    background: '#374151',
  },
  bodyLine: {
    width: '100%',
    height: 12,
    borderRadius: 4,
    background: '#1F2937',
  },
  bodyLineShort: {
    width: '55%',
    height: 12,
    borderRadius: 4,
    background: '#1F2937',
  },
  buttonRow: {
    display: 'flex',
    gap: 8,
    marginTop: 4,
  },
  button: {
    width: 96,
    height: 32,
    borderRadius: 6,
    background: '#374151',
  },
};

function FallbackCard({ alert }: { alert: Alert }) {
  const borderColor = SEVERITY_COLORS[alert.severity];

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        border: `2px solid ${borderColor}`,
        background: '#111827',
        color: '#F9FAFB',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            background: borderColor,
            color: '#FFF',
          }}
        >
          {alert.severity}
        </span>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>{alert.type}</span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 500 }}>
        Camera {alert.cameraId}
        {alert.location && (
          <span style={{ color: '#9CA3AF' }}> &mdash; {alert.location}</span>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#D1D5DB', margin: 0 }}>
        {alert.description}
      </p>

      {alert.thumbnailUrl && (
        <img
          src={alert.thumbnailUrl}
          alt={`Alert ${alert.alertId} thumbnail`}
          style={{ borderRadius: 4, maxWidth: '100%', maxHeight: 160, objectFit: 'cover' }}
        />
      )}

      <div style={{ fontSize: 12, color: '#6B7280' }}>
        {alert.alertId} &middot; {alert.timestamp}
      </div>
    </div>
  );
}

export function AlertOverlay({ alert }: AlertOverlayProps) {
  const [c1Content, setC1Content] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alert.alertId || !alert.cameraId || !alert.severity) {
      setLoading(false);
      setError(true);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    async function fetchCard() {
      setLoading(true);
      setError(false);
      setC1Content(null);

      try {
        const res = await fetch('/api/alert-trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`API responded with ${res.status}`);

        const data = await res.json();

        if (!controller.signal.aborted) {
          setC1Content(data.c1Response);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchCard();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [alert.alertId]);

  return (
    <div className="alert-overlay" data-severity={alert.severity}>
      {loading && <SkeletonLoader />}

      {error && !loading && <FallbackCard alert={alert} />}

      {c1Content && !loading && !error && (
        <ThemeProvider theme={{ mode: 'dark' }}>
          <C1Component content={c1Content} />
        </ThemeProvider>
      )}
    </div>
  );
}
