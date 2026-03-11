"use client";

import { useState } from "react";
import {
  ScanLine,
  Search,
  Slash,
  Circle,
  Zap,
  Layers,
  ShieldCheck,
  HardHat,
  Flame,
  AlertTriangle,
  BoxSelect,
  Truck,
  User,
  Hash,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DetectionModelSelectorProps {
  selectedModel: string | null;
  onModelSelect: (modelId: string) => void;
  isVisible: boolean;
}

interface ModelDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

interface CategoryDef {
  id: string;
  label: string;
  icon: LucideIcon;
  models: ModelDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "quality",
    label: "Quality",
    icon: Search,
    models: [
      { id: "scratch-detection", name: "Scratch Detection", description: "Surface scratches & marks", icon: Slash },
      { id: "dent-detection", name: "Dent Detection", description: "Dents & deformations", icon: Circle },
      { id: "crack-detection", name: "Crack Detection", description: "Cracks & fractures", icon: Zap },
      { id: "surface-anomaly", name: "Surface Anomaly", description: "General surface defects", icon: Layers },
    ],
  },
  {
    id: "safety",
    label: "Safety",
    icon: ShieldCheck,
    models: [
      { id: "ppe-detection", name: "PPE Detection", description: "Helmets, goggles, vests", icon: HardHat },
      { id: "fire-smoke-detection", name: "Fire & Smoke", description: "Fire and smoke alerts", icon: Flame },
      { id: "safety-hazard", name: "Hazard Detection", description: "Workplace hazards", icon: AlertTriangle },
    ],
  },
  {
    id: "objects",
    label: "Objects",
    icon: BoxSelect,
    models: [
      { id: "vehicle-detection", name: "Vehicle Detection", description: "Cars, trucks, forklifts", icon: Truck },
      { id: "face-detection", name: "Face Detection", description: "Face identification", icon: User },
      { id: "object-counting", name: "Object Counting", description: "Count items in scene", icon: Hash },
    ],
  },
  {
    id: "general",
    label: "General AI",
    icon: Sparkles,
    models: [
      { id: "", name: "Auto-detect", description: "AI analyzes based on your prompt", icon: Sparkles },
    ],
  },
];

function getModelsForCategory(categoryId: string): ModelDef[] {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat?.models ?? [];
}

function getSelectedModelData(modelId: string | null): { model: ModelDef; category: CategoryDef } | null {
  if (!modelId) return null;
  for (const cat of CATEGORIES) {
    const model = cat.models.find((m) => m.id === modelId);
    if (model) return { model, category: cat };
  }
  return null;
}

export function DetectionModelSelector({
  selectedModel,
  onModelSelect,
  isVisible,
}: DetectionModelSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const selectedData = getSelectedModelData(selectedModel);

  if (!isVisible) return null;

  return (
    <div className="mb-3 animate-in slide-in-from-bottom-2 duration-200">
      {/* Section label */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ScanLine className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-medium text-gray-500">Analysis Mode</span>
        </div>
        {selectedModel && (
          <button
            type="button"
            onClick={() => onModelSelect("")}
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category tabs — horizontal scrollable pills */}
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              className={`
                flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium
                transition-all duration-150 whitespace-nowrap
                ${isActive
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              <Icon className="h-3 w-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Model cards — shown when a category is expanded */}
      {activeCategory && (
        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {getModelsForCategory(activeCategory).map((model) => {
            const ModelIcon = model.icon;
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onModelSelect(model.id);
                  setActiveCategory(null);
                }}
                className={`
                  relative flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-150
                  ${isSelected
                    ? "border-indigo-200 bg-indigo-50 ring-1 ring-indigo-100"
                    : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm"
                  }
                `}
              >
                <div
                  className={`
                    flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
                    ${isSelected ? "bg-indigo-100" : "bg-gray-100"}
                  `}
                >
                  <ModelIcon className={`h-4 w-4 ${isSelected ? "text-indigo-600" : "text-gray-500"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                    {model.name}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{model.description}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected model indicator — shown when a model is selected and category is collapsed */}
      {selectedModel && !activeCategory && selectedData && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
            <selectedData.model.icon className="h-3 w-3 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-indigo-700">{selectedData.model.name}</p>
            <p className="text-xs text-indigo-400">{selectedData.category.label}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveCategory(selectedData.category.id)}
            className="text-xs font-medium text-indigo-500 transition-colors hover:text-indigo-700"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
