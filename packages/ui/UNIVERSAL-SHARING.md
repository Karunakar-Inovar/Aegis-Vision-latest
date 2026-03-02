# Inovar Universal UI – Platform Sharing Guide

## 1. Purpose
`packages/ui` is the single source of truth for every design-system primitive (atoms → templates). Components stay unstyled and framework-agnostic so the same API feeds both `apps/web` (Next.js + React Native Web) and `apps/native` (Expo/React Native).

## 2. File Resolution Model
| Target platform | Resolver looks for | Example |
| --- | --- | --- |
| React Native / Expo | `Component/index.native.tsx` (or `index.tsx` when `.native` missing) | `packages/ui/src/atoms/button.native.tsx` (uses `Pressable`) |
| Web (Next.js) | `Component/index.tsx` (or `index.web.tsx`) | `packages/ui/src/atoms/button.tsx` (DOM `<button>`) |

React Native Web automatically falls back to the shared `.tsx` version when no platform override is provided, so components that do not need web-specific behavior can ship a single file.

## 3. Component Authoring Rules
- No styling baked in; expose `className`, `style`, and any ARIA props.
- Avoid platform-only APIs (no DOM-only event props inside `.tsx`, no RN-only imports inside `.web.tsx`).
- Export prop types from each component and re-export through `packages/ui/src/index.ts`.
- Every component must have:
  - Storybook story in `packages/ui/src/**/Component.stories.tsx` (discovered via `apps/storybook`).
  - Unit tests (vitest or react-native-testing-library) colocated nearby.

## 4. Shared Utilities
- `packages/ui/utils/cn.ts` – platform-safe class merge helper.
- `packages/ui/utils/icons.tsx` – lucide icon barrel used by both platforms.
- `packages/ui/src/utils` – tokens and helpers shared by atoms/molecules.

## 5. Usage in Apps
- `apps/web`: import primitives from `ui`, style via Tailwind classes in `className`. Next.js automatically picks `.web.tsx`.
- `apps/native`: import the same primitives; NativeWind consumes the `className` via `cssInterop`.
- Higher-level app screens compose primitives plus platform-only wrappers; no business logic in `packages/ui`.

## 6. Workflow Recap
1. Build primitive in `packages/ui`.
2. Write Storybook stories next to the component; run via `yarn dev:storybook`.
3. Add tests.
4. Consume the primitive in both apps (`apps/web`, `apps/native`).
5. Keep prop signatures in sync; if a web-only prop is needed, create an adapter in the app layer, not in the primitive.

Share this guide with the team to reinforce that every design-system component is already dual-platform, and the `.web.tsx`/`.tsx` pairing is how we guarantee consistent APIs across React Native + web.

