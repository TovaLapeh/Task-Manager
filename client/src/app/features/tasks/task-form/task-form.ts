import { ChangeDetectionStrategy, Component, effect, inject, input, output } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { LanguageService } from "../../../core/i18n/language.service";
import { Task, TaskInput, TaskPriority, TaskStatus, TASK_PRIORITIES, TASK_STATUSES } from "../../../core/models/task.model";

const EMPTY_FORM_VALUE = {
  title: "",
  description: "",
  priority: TaskPriority.Medium,
  dueDate: "",
  status: TaskStatus.Pending,
};

/**
 * Presentational component: owns the reactive form and its validation only.
 * It does not know about the HTTP API — the parent container decides what
 * "save" means (create vs. update) and performs the request. This keeps the
 * form reusable and easy to unit test in isolation.
 */
@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./task-form.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskForm {
  /** UI translations only; does not participate in form state or validation. */
  protected readonly i18n = inject(LanguageService);

  readonly taskToEdit = input<Task | null>(null);
  readonly saving = input(false);

  readonly save = output<TaskInput>();
  readonly cancelEdit = output<void>();

  readonly priorities = TASK_PRIORITIES;
  readonly statuses = TASK_STATUSES;

  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly form = this.formBuilder.group({
    title: ["", [Validators.required, Validators.maxLength(200)]],
    description: [""],
    priority: [TaskPriority.Medium, Validators.required],
    dueDate: ["", Validators.required],
    status: [TaskStatus.Pending, Validators.required],
  });

  get isEditMode(): boolean {
    return this.taskToEdit() !== null;
  }

  constructor() {
    // Keep the form in sync with whichever task the parent selected for editing.
    effect(() => {
      const task = this.taskToEdit();
      if (task) {
        this.form.setValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          status: task.status,
        });
      } else {
        this.form.reset(EMPTY_FORM_VALUE);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.resetForm();
    this.cancelEdit.emit();
  }

  /** Called by the parent after a successful create, and on cancel. */
  resetForm(): void {
    this.form.reset(EMPTY_FORM_VALUE);
  }
}
