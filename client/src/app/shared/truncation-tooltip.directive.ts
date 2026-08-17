import { Directive, ElementRef, OnDestroy, effect, inject, input } from "@angular/core";
import { BootstrapTooltip, tooltipPlugin } from "./bootstrap-plugins";

/**
 * Shows the full text in a Bootstrap tooltip, but only when the host element
 * is actually clipped (e.g. a description hitting the two-line clamp).
 *
 * Why a directive rather than the plain `title` attribute: the native tooltip
 * never appears on touch devices and cannot be styled. The tooltip is created
 * lazily on first hover/focus so we pay nothing for rows that fit, and the
 * host keeps `tabindex="0"` so keyboard and touch users can reach it too.
 */
@Directive({
  selector: "[appTruncationTooltip]",
  standalone: true,
  host: {
    "(mouseenter)": "activate()",
    "(focus)": "activate()",
  },
})
export class TruncationTooltip implements OnDestroy {
  /** Full, untruncated text to display. */
  readonly text = input.required<string>({ alias: "appTruncationTooltip" });

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private tooltip: BootstrapTooltip | null = null;

  constructor() {
    // Rows are reused across data changes (tracked by id), so drop a stale
    // tooltip whenever the text it was built from changes.
    effect(() => {
      this.text();
      this.destroyTooltip();
    });
  }

  activate(): void {
    if (this.tooltip) {
      return;
    }

    const element = this.host.nativeElement;
    const isClipped =
      element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1;
    if (!isClipped) {
      return;
    }

    const Tooltip = tooltipPlugin();
    if (!Tooltip) {
      return;
    }

    // Prevent the native tooltip from doubling up with the Bootstrap one.
    element.removeAttribute("title");

    this.tooltip = new Tooltip(element, {
      title: this.text(),
      placement: "top",
      trigger: "hover focus",
      container: "body",
    });
    this.tooltip.show();
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  private destroyTooltip(): void {
    this.tooltip?.dispose();
    this.tooltip = null;
  }
}
