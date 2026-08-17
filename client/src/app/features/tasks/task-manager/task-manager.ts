import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { LanguageService } from "../../../core/i18n/language.service";
import { Task, TaskInput } from "../../../core/models/task.model";
import { TaskService } from "../../../core/services/task.service";
import { BootstrapModal, modalPlugin } from "../../../shared/bootstrap-plugins";
import { TaskForm } from "../task-form/task-form";
import { TaskList } from "../task-list/task-list";

/**
 * Smart/container component: owns all task state and API orchestration.
 * TaskForm and TaskList stay presentational (inputs in, events out), which
 * keeps them easy to reuse and unit test without mocking HTTP.
 */
@Component({
  selector: "app-task-manager",
  standalone: true,
  imports: [TaskForm, TaskList],
  // Full-height flex column so the footer's mt-auto pins it to the bottom
  // even when there are few tasks.
  host: { class: "d-flex flex-column min-vh-100" },
  templateUrl: "./task-manager.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskManager implements OnInit, OnDestroy {
  private readonly taskService = inject(TaskService);
  private readonly taskForm = viewChild.required(TaskForm);
  private readonly modalElement = viewChild.required<ElementRef<HTMLElement>>("taskModal");

  private modal: BootstrapModal | null = null;

  /** UI translations only; does not participate in task state or CRUD. */
  protected readonly i18n = inject(LanguageService);

  readonly tasks = signal<Task[]>([]);
  readonly editingTask = signal<Task | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService.getAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }

  onSave(input: TaskInput): void {
    const editing = this.editingTask();
    this.saving.set(true);
    this.errorMessage.set(null);

    const request = editing ? this.taskService.update(editing.id, input) : this.taskService.create(input);

    request.subscribe({
      next: (task) => {
        this.saving.set(false);
        if (editing) {
          this.tasks.update((tasks) => tasks.map((t) => (t.id === task.id ? task : t)));
          this.successMessage.set(`"${task.title}" was updated.`);
        } else {
          this.tasks.update((tasks) => [...tasks, task]);
          this.successMessage.set(`"${task.title}" was created.`);
        }
        this.closeForm();
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  /** Opens the form in create mode. */
  openCreateForm(): void {
    this.editingTask.set(null);
    // editingTask may already have been null (e.g. two creates in a row), in
    // which case TaskForm's effect will not re-run, so clear it explicitly.
    this.taskForm().resetForm();
    this.errorMessage.set(null);
    this.openModal();
  }

  onEdit(task: Task): void {
    this.editingTask.set(task);
    this.errorMessage.set(null);
    this.openModal();
  }

  onCancelEdit(): void {
    this.closeForm();
  }

  onDelete(task: Task): void {
    this.errorMessage.set(null);

    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
        this.successMessage.set(`"${task.title}" was deleted.`);
        if (this.editingTask()?.id === task.id) {
          this.editingTask.set(null);
        }
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
      },
    });
  }

  ngOnDestroy(): void {
    this.modal?.dispose();
    this.modal = null;
  }

  /**
   * The modal is driven programmatically rather than with data-bs-toggle,
   * because it must also close itself after a save completes (async).
   */
  private openModal(): void {
    this.resolveModal()?.show();
  }

  private closeForm(): void {
    this.resolveModal()?.hide();
    // Bootstrap's hide() is animated; clearing edit state here (rather than on
    // the hidden event) keeps it in sync even if the plugin is unavailable.
    this.editingTask.set(null);
  }

  private resolveModal(): BootstrapModal | null {
    if (!this.modal) {
      const Modal = modalPlugin();
      if (!Modal) {
        return null;
      }
      this.modal = new Modal(this.modalElement().nativeElement);
      // Also covers dismissal by Escape, backdrop click or the close button.
      this.modalElement().nativeElement.addEventListener("hidden.bs.modal", () => {
        this.editingTask.set(null);
      });
    }
    return this.modal;
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }
}
