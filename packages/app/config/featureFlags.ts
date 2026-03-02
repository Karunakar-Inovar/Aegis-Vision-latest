/**
 * Feature Flags
 *
 * Next.js inlines NEXT_PUBLIC_* env vars at build time, but ONLY for
 * static literal access like `process.env.NEXT_PUBLIC_FOO`.
 * Dynamic bracket access (`process.env[variable]`) is never replaced.
 * That's why each flag must reference its env var directly.
 */

export const featureFlags = {
  /** Bring-Your-Own-Model flow (upload / REST). */
  byom: process.env.NEXT_PUBLIC_FEATURE_BYOM?.toLowerCase() === "true",

  /** Build-Your-Own-Model flow (dataset → train → deploy). */
  buildOwnModel:
    process.env.NEXT_PUBLIC_FEATURE_BUILD_OWN_MODEL?.toLowerCase() === "true",

  /** BYOM REST endpoint integration — hidden from UI; kept for future use. */
  byomRest:
    process.env.NEXT_PUBLIC_FEATURE_BYOM_REST?.toLowerCase() === "true",
} as const;

export type FeatureFlags = typeof featureFlags;
