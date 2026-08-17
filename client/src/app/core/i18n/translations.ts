import { TaskPriority, TaskStatus } from "../models/task.model";

export type Language = "en" | "he";

export const DEFAULT_LANGUAGE: Language = "en";

/**
 * Shape of the UI dictionary. Both language dictionaries must satisfy this
 * interface, so a missing or misspelled key is a compile-time error rather
 * than a blank label at runtime.
 *
 * Only STATIC UI text lives here; task data (titles, descriptions) is never
 * translated.
 *
 * `priorities`/`statuses` are DISPLAY LABELS for the enum values only. The
 * stored value, the form control value, and the API payload always remain the
 * canonical English enum ("High", "In Progress", …) — see the <option
 * [value]> bindings in task-form.html.
 */
export interface Translations {
  app: {
    title: string;
    subtitle: string;
  };
  language: {
    label: string;
    english: string;
    hebrew: string;
  };
  footer: {
    rights: string;
  };
  form: {
    newTask: string;
    editTask: string;
    title: string;
    titlePlaceholder: string;
    dueDate: string;
    description: string;
    descriptionPlaceholder: string;
    priority: string;
    status: string;
    save: string;
    update: string;
    cancel: string;
    titleRequired: string;
    titleMaxLength: string;
    dueDateRequired: string;
  };
  tasks: {
    heading: string;
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate: string;
    actions: string;
    empty: string;
    noDescription: string;
    edit: string;
    delete: string;
    loading: string;
  };
  /** Display labels for TaskPriority values (never the stored value). */
  priorities: Record<TaskPriority, string>;
  /** Display labels for TaskStatus values (never the stored value). */
  statuses: Record<TaskStatus, string>;
}

const en: Translations = {
  app: {
    title: "Task Manager",
    subtitle: "Create, track, and organize your tasks.",
  },
  language: {
    label: "Language",
    // Language names are conventionally shown in their own language, so these
    // are identical in every dictionary rather than translated.
    english: "English",
    hebrew: "עברית",
  },
  footer: {
    rights: "All rights reserved to Tova Lapeh",
  },
  form: {
    newTask: "New Task",
    editTask: "Edit Task",
    title: "Title",
    titlePlaceholder: "e.g. Write project report",
    dueDate: "Due Date",
    description: "Description",
    descriptionPlaceholder: "Optional details about the task",
    priority: "Priority",
    status: "Status",
    save: "Save",
    update: "Update",
    cancel: "Cancel",
    titleRequired: "Title is required.",
    titleMaxLength: "Title must be 200 characters or fewer.",
    dueDateRequired: "Due date is required.",
  },
  tasks: {
    heading: "Tasks",
    id: "ID",
    title: "Title",
    description: "Description",
    priority: "Priority",
    status: "Status",
    dueDate: "Due Date",
    actions: "Actions",
    empty: "No tasks yet. Use the form to create one.",
    noDescription: "No description",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading tasks…",
  },
  priorities: {
    [TaskPriority.Low]: "Low",
    [TaskPriority.Medium]: "Medium",
    [TaskPriority.High]: "High",
  },
  statuses: {
    [TaskStatus.Pending]: "Pending",
    [TaskStatus.InProgress]: "In Progress",
    [TaskStatus.Completed]: "Completed",
  },
};

const he: Translations = {
  app: {
    title: "מנהל משימות",
    subtitle: "צרו, עקבו וארגנו את המשימות שלכם.",
  },
  language: {
    label: "שפה",
    // Language names are conventionally shown in their own language, so these
    // are identical in every dictionary rather than translated.
    english: "English",
    hebrew: "עברית",
  },
  footer: {
    rights: "כל הזכויות שמורות לטובה לפה",
  },
  form: {
    newTask: "משימה חדשה",
    editTask: "עריכת משימה",
    title: "כותרת משימה",
    titlePlaceholder: "לדוגמה: לכתוב דוח פרויקט",
    dueDate: "תאריך יעד",
    description: "תיאור משימה",
    descriptionPlaceholder: "פרטים נוספים על המשימה (לא חובה)",
    priority: "עדיפות",
    status: "סטטוס",
    save: "הוסף משימה",
    update: "עדכון",
    cancel: "ביטול",
    titleRequired: "יש להזין כותרת.",
    titleMaxLength: "הכותרת יכולה להכיל עד 200 תווים.",
    dueDateRequired: "יש לבחור תאריך יעד.",
  },
  tasks: {
    heading: "משימות",
    id: "מזהה",
    title: "כותרת",
    description: "תיאור",
    priority: "עדיפות",
    status: "סטטוס",
    dueDate: "תאריך יעד",
    actions: "פעולות",
    empty: "אין משימות עדיין. השתמשו בטופס כדי ליצור משימה.",
    noDescription: "אין תיאור",
    edit: "עריכה",
    delete: "מחיקה",
    loading: "טוען משימות…",
  },
  // Feminine forms, to agree with "משימה".
  priorities: {
    [TaskPriority.Low]: "נמוכה",
    [TaskPriority.Medium]: "בינונית",
    [TaskPriority.High]: "גבוהה",
  },
  statuses: {
    [TaskStatus.Pending]: "ממתינה",
    [TaskStatus.InProgress]: "בביצוע",
    [TaskStatus.Completed]: "הושלמה",
  },
};

export const TRANSLATIONS: Record<Language, Translations> = { en, he };

/** Text direction per language, used to set dir/lang on <html>. */
export const TEXT_DIRECTION: Record<Language, "ltr" | "rtl"> = { en: "ltr", he: "rtl" };
