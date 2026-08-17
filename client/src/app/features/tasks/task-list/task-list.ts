import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { LanguageService } from "../../../core/i18n/language.service";
import { Task } from "../../../core/models/task.model";
import { TaskItem } from "../task-item/task-item";

@Component({
  selector: "app-task-list",
  standalone: true,
  imports: [TaskItem],
  templateUrl: "./task-list.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList {
  /** UI translations only; does not participate in task state or CRUD. */
  protected readonly i18n = inject(LanguageService);

  readonly tasks = input.required<Task[]>();

  readonly edit = output<Task>();
  readonly delete = output<Task>();
}
