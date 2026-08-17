import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { LanguageService } from "../../../core/i18n/language.service";
import { Task, TaskPriority, TaskStatus } from "../../../core/models/task.model";
import { TruncationTooltip } from "../../../shared/truncation-tooltip.directive";

const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  [TaskPriority.Low]: "text-bg-secondary",
  [TaskPriority.Medium]: "text-bg-warning",
  [TaskPriority.High]: "text-bg-danger",
};

// "In Progress" uses info (teal) rather than primary: now that the theme
// colour is green, primary and success would render as the same colour and
// "In Progress" would be indistinguishable from "Completed".
const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: "text-bg-secondary",
  [TaskStatus.InProgress]: "text-bg-info",
  [TaskStatus.Completed]: "text-bg-success",
};

/** Renders a single task row. Kept separate from TaskList so row-level
 * presentation (badges, actions) doesn't clutter the list/table shell.
 *
 * Attribute selector on <tr> (rather than an element selector) so the
 * component *is* the row: an <app-task-item> wrapper element between <tbody>
 * and <tr> would break Bootstrap's child-combinator table rules
 * (.table-striped/.table-hover > tbody > tr) and column alignment. */
@Component({
  selector: "tr[app-task-item]",
  standalone: true,
  imports: [TruncationTooltip],
  templateUrl: "./task-item.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItem {
  /** UI translations only; does not participate in task state or CRUD. */
  protected readonly i18n = inject(LanguageService);

  readonly task = input.required<Task>();

  readonly edit = output<Task>();
  readonly delete = output<Task>();

  get priorityBadgeClass(): string {
    return PRIORITY_BADGE_CLASS[this.task().priority];
  }

  get statusBadgeClass(): string {
    return STATUS_BADGE_CLASS[this.task().status];
  }

  onEdit(): void {
    this.edit.emit(this.task());
  }

  onDelete(): void {
    this.delete.emit(this.task());
  }
}
