/**
 * Typed access to the Bootstrap JS plugins we use.
 *
 * bootstrap.bundle.min.js is loaded globally via angular.json "scripts", so it
 * is not importable as a module and ships no types here. Rather than repeating
 * an untyped `window` cast at each call site, the minimal surface we rely on is
 * declared once. Each accessor returns null when the bundle is unavailable, so
 * callers can degrade gracefully instead of throwing.
 */

export interface BootstrapTooltip {
  show(): void;
  dispose(): void;
}

export interface BootstrapModal {
  show(): void;
  hide(): void;
  dispose(): void;
}

interface BootstrapTooltipConstructor {
  new (
    element: Element,
    options: { title: string; placement: string; trigger: string; container: string },
  ): BootstrapTooltip;
}

interface BootstrapModalConstructor {
  new (element: Element, options?: { backdrop?: boolean | "static"; keyboard?: boolean }): BootstrapModal;
}

interface BootstrapGlobal {
  Tooltip?: BootstrapTooltipConstructor;
  Modal?: BootstrapModalConstructor;
}

function bootstrapGlobal(): BootstrapGlobal | null {
  return (window as unknown as { bootstrap?: BootstrapGlobal }).bootstrap ?? null;
}

export function tooltipPlugin(): BootstrapTooltipConstructor | null {
  return bootstrapGlobal()?.Tooltip ?? null;
}

export function modalPlugin(): BootstrapModalConstructor | null {
  return bootstrapGlobal()?.Modal ?? null;
}
