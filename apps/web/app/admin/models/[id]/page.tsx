"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Badge,
  Separator,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Label,
  ToggleSwitch,
  Snackbar,
  useSnackbar,
} from "ui";
import {
  ArrowLeft,
  Brain,
  MoreVertical,
  Copy,
  Trash2,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Info,
  Upload,
  FileText,
  Tag,
  Power,
  Cpu,
  X,
  Pencil,
  Rocket,
} from "ui/utils/icons";
import {
  useModelStore,
  useHasHydrated,
  ModelStatus,
  ModelSourceType,
  SOURCE_TYPE_LABELS,
  MODEL_STATUS_LABELS,
} from "app/store/models";

// ── Badge colour maps ───────────────────────────────────────────────────────
const frameworkColors: Record<string, string> = {
  YOLO: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  TensorFlow: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  PyTorch: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  ONNX: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400",
  OpenVINO: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
  Custom: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusColors: Record<string, string> = {
  [ModelStatus.DRAFT]: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400",
  [ModelStatus.VALIDATED]: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400",
  [ModelStatus.PUBLISHED]: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  [ModelStatus.DEPLOYED]: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
};

const sourceTypeColors: Record<string, string> = {
  [ModelSourceType.PRE_DEFINED]: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400",
  [ModelSourceType.BYOM]: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  [ModelSourceType.BUILD_YOUR_MODEL]: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  Model Detail Page
// ══════════════════════════════════════════════════════════════════════════════
export default function ModelDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const modelId = params?.id ?? "";
  const snackbar = useSnackbar();

  const model = useModelStore((s) => s.models.find((m) => m.id === modelId));
  const hydrated = useHasHydrated();
  const updateModel = useModelStore((s) => s.updateModel);
  const removeModel = useModelStore((s) => s.removeModel);

  // ── Local UI state ─────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Use-case editing
  const [useCaseModalOpen, setUseCaseModalOpen] = useState(false);
  const [editUseCaseName, setEditUseCaseName] = useState("");
  const [editUseCaseActive, setEditUseCaseActive] = useState(true);
  const [editUseCaseClasses, setEditUseCaseClasses] = useState<string[]>([]);
  const [newClassInput, setNewClassInput] = useState("");

  // ── Close kebab on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // ── Use Case modal setup ──────────────────────────────────────────────
  const openUseCaseModal = useCallback(() => {
    if (!model) return;
    setEditUseCaseName(model.name);
    setEditUseCaseActive(model.status !== ModelStatus.DRAFT);
    setEditUseCaseClasses([...model.labels]);
    setNewClassInput("");
    setUseCaseModalOpen(true);
  }, [model]);

  const handleAddClass = useCallback(() => {
    const trimmed = newClassInput.trim().toLowerCase();
    if (!trimmed || editUseCaseClasses.includes(trimmed)) return;
    setEditUseCaseClasses((prev) => [...prev, trimmed]);
    setNewClassInput("");
  }, [newClassInput, editUseCaseClasses]);

  const handleRemoveClass = useCallback((cls: string) => {
    setEditUseCaseClasses((prev) => prev.filter((c) => c !== cls));
  }, []);

  const handleSaveUseCase = useCallback(() => {
    if (!model) return;
    updateModel(model.id, {
      labels: editUseCaseClasses,
    });
    snackbar.success("Use case updated successfully.");
    setUseCaseModalOpen(false);
  }, [model, editUseCaseClasses, updateModel, snackbar]);

  // ── Delete handler ─────────────────────────────────────────────────────
  const handleDeleteModel = useCallback(() => {
    if (!model) return;
    removeModel(model.id);
    snackbar.success(`Model "${model.name}" deleted.`);
    setDeleteDialogOpen(false);
    router.push("/admin/models");
  }, [model, removeModel, snackbar, router]);

  // ── Loading / not found ────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading model details...</p>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onPress={() => router.push("/admin/models")}>
            <Icon icon={ArrowLeft} className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Model Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="p-4 rounded-full bg-muted">
                <Icon icon={AlertTriangle} className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Could not find a model with ID &ldquo;{modelId}&rdquo;.
              </p>
              <Button variant="outline" onPress={() => router.push("/admin/models")}>
                Back to Models
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isByom = model.sourceType === ModelSourceType.BYOM;
  const isPreDefined = model.sourceType === ModelSourceType.PRE_DEFINED;
  const isBuildYourModel = model.sourceType === ModelSourceType.BUILD_YOUR_MODEL;

  // ══════════════════════════════════════════════════════════════════════════
  //  Render
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onPress={() => router.push("/admin/models")}>
          <Icon icon={ArrowLeft} className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Models</span>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground truncate">{model.name}</span>
      </div>

      {/* ── Title row ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="p-3 rounded-full bg-muted shrink-0">
            <Icon icon={Brain} className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
              {model.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={sourceTypeColors[model.sourceType] || ""}>
                {SOURCE_TYPE_LABELS[model.sourceType]}
              </Badge>
              <Badge variant="outline" className={statusColors[model.status] || ""}>
                {MODEL_STATUS_LABELS[model.status]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Kebab menu */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={menuRef}>
            <Button variant="ghost" size="icon" className="h-9 w-9" onPress={() => setMenuOpen((p) => !p)}>
              <Icon icon={MoreVertical} className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
                <button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer" onClick={() => setMenuOpen(false)}>
                  <Icon icon={Copy} className="h-4 w-4 text-muted-foreground" />Duplicate Model
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer" onClick={() => setMenuOpen(false)}>
                  <Icon icon={Archive} className="h-4 w-4 text-muted-foreground" />Archive
                </button>
                <Separator className="my-1" />
                <button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" onClick={() => { setMenuOpen(false); setDeleteDialogOpen(true); }}>
                  <Icon icon={Trash2} className="h-4 w-4" />Delete Model
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── 1) Model Overview Card ───────────────────────────────────── */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Icon icon={Cpu} className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Model Overview</h3>
            </div>
            <div className="space-y-4">
              <FieldRow
                label="Model Name"
                helper="Must be unique across all models in the workspace"
              >
                <span className="text-sm font-medium text-foreground">{model.name}</span>
              </FieldRow>

              <Separator />

              <FieldRow
                label="Model Type"
                helper="Determines how the model is managed and configured"
              >
                <Badge variant="outline" className={sourceTypeColors[model.sourceType] || ""}>
                  {SOURCE_TYPE_LABELS[model.sourceType]}
                </Badge>
              </FieldRow>

              <Separator />

              <FieldRow
                label="Framework / Version"
                helper="Must be compatible with the deployment target runtime"
              >
                {model.framework ? (
                  <Badge variant="outline" className={frameworkColors[model.framework] || ""}>
                    {model.framework}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </FieldRow>

              <Separator />

              <FieldRow label="Status">
                <Badge variant="outline" className={statusColors[model.status] || ""}>
                  {MODEL_STATUS_LABELS[model.status]}
                </Badge>
              </FieldRow>

              <Separator />

              <FieldRow label="Created">
                <span className="text-sm text-foreground">{formatDate(model.createdAt)}</span>
              </FieldRow>

              <FieldRow label="Last Updated">
                <span className="text-sm text-foreground">{formatDate(model.updatedAt)}</span>
              </FieldRow>
            </div>
          </CardContent>
        </Card>

        {/* ── 2) Use Case Card ────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Icon icon={Tag} className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Use Case</h3>
              </div>
              <Button variant="outline" size="sm" onPress={openUseCaseModal}>
                <Icon icon={Pencil} className="h-3.5 w-3.5 mr-1.5" />
                Edit Use Case
              </Button>
            </div>
            <div className="space-y-4">
              <FieldRow label="Use Case Name">
                <span className="text-sm font-medium text-foreground">{model.name}</span>
              </FieldRow>

              <Separator />

              <FieldRow
                label="Active"
                helper="Only active use cases are available to select in pipelines"
              >
                <Badge
                  variant="outline"
                  className={
                    model.status !== ModelStatus.DRAFT
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400"
                  }
                >
                  <Icon icon={Power} className="h-3 w-3 mr-1" />
                  {model.status !== ModelStatus.DRAFT ? "Active" : "Inactive"}
                </Badge>
              </FieldRow>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">Classes / Objects</span>
                  <HelperTooltip text="Used for pipelines and alerting rules" />
                </div>
                {model.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {model.labels.map((label) => (
                      <Badge
                        key={label}
                        variant="outline"
                        className="bg-muted/50 text-foreground border-border px-2.5 py-1 text-xs font-medium"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No classes defined yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 3) Upload & Validation Card (BYOM only) ─────────────────── */}
        {isByom && model.byomConfig && (
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Icon icon={Upload} className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Upload &amp; Validation</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/admin/models/${model.id}/build`)}
                >
                  <Icon icon={Upload} className="h-3.5 w-3.5 mr-1.5" />
                  Re-upload Model
                </Button>
              </div>

              {model.byomConfig.type === "upload" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <FieldRow label="Uploaded File">
                      <div className="flex items-center gap-2">
                        <Icon icon={FileText} className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground font-mono">
                          {model.byomConfig.fileName}
                        </span>
                      </div>
                    </FieldRow>
                    <Separator />
                    <FieldRow label="File Size">
                      <span className="text-sm text-foreground">
                        {(model.byomConfig.fileSize / 1_000_000).toFixed(1)} MB
                      </span>
                    </FieldRow>
                    <Separator />
                    <FieldRow label="Uploaded At">
                      <span className="text-sm text-foreground">
                        {formatDateTime(model.byomConfig.uploadedAt)}
                      </span>
                    </FieldRow>
                  </div>

                  <div className="space-y-4">
                    <FieldRow label="Validation Result">
                      {model.byomConfig.packageValidated ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Icon icon={CheckCircle2} className="h-3 w-3 mr-1" />Passed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400">
                          <Icon icon={AlertTriangle} className="h-3 w-3 mr-1" />Failed
                        </Badge>
                      )}
                    </FieldRow>

                    {!model.byomConfig.packageValidated && model.validationReport && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Error Messages</span>
                          <div className="space-y-1.5">
                            {model.validationReport.checks
                              .filter((c) => !c.passed)
                              .map((c) => (
                                <div
                                  key={c.key}
                                  className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400"
                                >
                                  <Icon icon={AlertTriangle} className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                  <span>{c.label}: {c.fixMessage || c.description}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}

                    {model.byomConfig.packageValidated && model.validationReport && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Validation Checks</span>
                          <div className="space-y-1.5">
                            {model.validationReport.checks.map((c) => (
                              <div
                                key={c.key}
                                className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400"
                              >
                                <Icon icon={CheckCircle2} className="h-3.5 w-3.5 shrink-0" />
                                <span>{c.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <FieldRow label="Endpoint URL">
                      <span className="text-sm font-medium text-foreground font-mono truncate max-w-[240px] block">
                        {model.byomConfig.endpointUrl}
                      </span>
                    </FieldRow>
                    <Separator />
                    <FieldRow label="Auth Type">
                      <span className="text-sm text-foreground">
                        {model.byomConfig.authType === "none"
                          ? "None"
                          : model.byomConfig.authType === "api-key"
                            ? "API Key"
                            : "Bearer Token"}
                      </span>
                    </FieldRow>
                  </div>
                  <div className="space-y-4">
                    <FieldRow label="Connection Tested">
                      {model.byomConfig.connectionTested ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Icon icon={CheckCircle2} className="h-3 w-3 mr-1" />Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Untested
                        </Badge>
                      )}
                    </FieldRow>
                    <Separator />
                    <FieldRow label="Latency">
                      <span className="text-sm text-foreground">
                        {model.byomConfig.latencyMs ? `${model.byomConfig.latencyMs} ms` : "N/A"}
                      </span>
                    </FieldRow>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── 4) Pre-defined Info Card ─────────────────────────────────── */}
        {isPreDefined && (
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-violet-50/50 border border-violet-100 dark:bg-violet-900/10 dark:border-violet-800/30">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
                  <Icon icon={Shield} className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-violet-900 dark:text-violet-300">
                    Managed by Aegis Vision
                  </p>
                  <p className="text-sm text-violet-700 dark:text-violet-400">
                    This model is maintained by the Aegis Vision backend. Configuration is limited to use case settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── 5) Build Your Model Info Card ────────────────────────────── */}
        {isBuildYourModel && (
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-teal-50/50 border border-teal-100 dark:bg-teal-900/10 dark:border-teal-800/30">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 shrink-0">
                  <Icon icon={Cpu} className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-teal-900 dark:text-teal-300">
                      Build Your Model
                    </p>
                    <p className="text-sm text-teal-700 dark:text-teal-400">
                      Build your model is coming soon. This feature will allow you to train custom models directly on the platform.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled className="opacity-60">
                    <Icon icon={Rocket} className="h-3.5 w-3.5 mr-1.5" />
                    Start Building
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Model Contract (BYOM with contract) ─────────────────────── */}
        {model.byomConfig?.contract && (
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Icon icon={Shield} className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Model Contract</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <FieldRow label="Input Type">
                    <span className="text-sm font-medium text-foreground">{model.byomConfig.contract.inputType}</span>
                  </FieldRow>
                  <Separator />
                  <FieldRow label="Output Type">
                    <span className="text-sm font-medium text-foreground">{model.byomConfig.contract.outputType}</span>
                  </FieldRow>
                </div>
                {model.byomConfig.contract.labelMappings.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Label Mapping</span>
                    <div className="rounded-md border border-border overflow-hidden">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
                        <span>External Label</span>
                        <span />
                        <span>Internal Label</span>
                      </div>
                      {model.byomConfig.contract.labelMappings.map((m, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 border-b border-border last:border-b-0"
                        >
                          <span className="text-sm font-mono text-foreground truncate">{m.externalLabel}</span>
                          <span className="text-muted-foreground">&rarr;</span>
                          <span className="text-sm font-mono text-foreground truncate">{m.internalLabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Edit Use Case Modal ─────────────────────────────────────── */}
      <Dialog
        open={useCaseModalOpen}
        onOpenChange={(open) => {
          setUseCaseModalOpen(open);
          if (!open) setNewClassInput("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Use Case</DialogTitle>
            <DialogDescription>
              Update the use case configuration for this model.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            {/* Use Case Name */}
            <div className="space-y-1.5">
              <Label htmlFor="uc-name">Use Case Name</Label>
              <Input
                id="uc-name"
                value={editUseCaseName}
                onChangeText={setEditUseCaseName}
                placeholder="e.g., PPE Compliance"
              />
              <p className="text-xs text-muted-foreground">
                Descriptive name for this use case
              </p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activate Use Case</Label>
                <p className="text-xs text-muted-foreground">
                  Only active use cases are available to select in pipelines
                </p>
              </div>
              <ToggleSwitch
                checked={editUseCaseActive}
                onCheckedChange={setEditUseCaseActive}
                size="sm"
              />
            </div>

            <Separator />

            {/* Classes list */}
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label>Classes / Objects</Label>
                <p className="text-xs text-muted-foreground">
                  Used for pipelines and alerting rules
                </p>
              </div>

              {editUseCaseClasses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editUseCaseClasses.map((cls) => (
                    <Badge
                      key={cls}
                      variant="outline"
                      className="bg-muted/50 text-foreground border-border pl-2.5 pr-1 py-1 text-xs font-medium flex items-center gap-1"
                    >
                      {cls}
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(cls)}
                        className="ml-0.5 p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors"
                      >
                        <Icon icon={X} className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a class (e.g., helmet)..."
                  value={newClassInput}
                  onChangeText={setNewClassInput}
                  onSubmitEditing={handleAddClass}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleAddClass}
                  disabled={!newClassInput.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onPress={handleSaveUseCase}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Model Dialog ────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{model.name}&quot;? This action cannot be undone. All assignments and versions will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onPress={handleDeleteModel}>
                <Icon icon={Trash2} className="h-4 w-4 mr-2" />Delete Model
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Snackbar */}
      <Snackbar visible={snackbar.state.visible} message={snackbar.state.message} variant={snackbar.state.variant} onClose={snackbar.hide} />
    </div>
  );
}

// ── Helper: Field Row with optional helper text ───────────────────────────
function FieldRow({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        {helper && <HelperTooltip text={helper} />}
      </div>
      <div className="text-right">{children}</div>
    </div>
  );
}

// ── Helper: Info tooltip icon ─────────────────────────────────────────────
function HelperTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    if (show) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        className="inline-flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        onClick={() => setShow((p) => !p)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        aria-label={text}
      >
        <Icon icon={Info} className="h-3.5 w-3.5" />
      </button>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-56 rounded-md bg-popover border border-border px-3 py-2 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 rotate-45 bg-popover border-r border-b border-border -mt-1" />
        </div>
      )}
    </div>
  );
}
