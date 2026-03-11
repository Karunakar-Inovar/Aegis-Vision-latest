"use client";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Defect {
  id: string;
  type: string;
  confidence: number;
  severity: "critical" | "major" | "minor";
  boundingBox?: BoundingBox;
}

interface AnnotatedImageOverlayProps {
  imageUrl: string;
  defects: Defect[];
  alt?: string;
  className?: string;
}

const SEVERITY_COLORS = {
  critical: "border-red-500 bg-red-500/20",
  major: "border-amber-500 bg-amber-500/20",
  minor: "border-yellow-500 bg-yellow-500/20",
} as const;

export function AnnotatedImageOverlay({
  imageUrl,
  defects,
  alt = "Annotated detection result",
  className = "",
}: AnnotatedImageOverlayProps) {
  const boxesWithCoords = defects.filter((d) => d.boundingBox);

  return (
    <div
      className={`relative inline-block max-w-full overflow-hidden rounded-lg border border-gray-200 ${className}`}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={alt}
          className="block max-h-[400px] w-full object-contain"
        />
        {boxesWithCoords.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {boxesWithCoords.map((defect) => {
              const bb = defect.boundingBox!;
              const colorClass =
                SEVERITY_COLORS[defect.severity] ?? SEVERITY_COLORS.minor;
              return (
                <div
                  key={defect.id}
                  className={`absolute border-2 ${colorClass} rounded-sm`}
                  style={{
                    left: `${bb.x * 100}%`,
                    top: `${bb.y * 100}%`,
                    width: `${bb.width * 100}%`,
                    height: `${bb.height * 100}%`,
                  }}
                  title={`${defect.type} (${Math.round(defect.confidence * 100)}%)`}
                >
                  <span className="absolute -top-6 left-0 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-white whitespace-nowrap">
                    {defect.type} {Math.round(defect.confidence * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
