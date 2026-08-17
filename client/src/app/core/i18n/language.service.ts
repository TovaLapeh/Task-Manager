import { DOCUMENT } from "@angular/common";
import { Injectable, computed, effect, inject, signal } from "@angular/core";
import {
  DEFAULT_LANGUAGE,
  Language,
  TEXT_DIRECTION,
  TRANSLATIONS,
  Translations,
} from "./translations";

const STORAGE_KEY = "task-manager.language";

/**
 * Holds the active UI language and exposes the matching dictionary.
 *
 * Deliberately isolated from TaskService/TaskManager: switching language only
 * changes a signal, so it never touches task state or issues an HTTP request.
 */
@Injectable({ providedIn: "root" })
export class LanguageService {
  private readonly document = inject(DOCUMENT);

  private readonly currentLanguage = signal<Language>(this.readStoredLanguage());

  /** Active language, for highlighting the selected button. */
  readonly language = this.currentLanguage.asReadonly();

  /** Active dictionary. Templates read it as `i18n.t().tasks.heading`. */
  readonly t = computed<Translations>(() => TRANSLATIONS[this.currentLanguage()]);

  readonly direction = computed(() => TEXT_DIRECTION[this.currentLanguage()]);

  constructor() {
    // Keep <html lang/dir> in sync so the browser applies RTL to the whole UI.
    effect(() => {
      const root = this.document.documentElement;
      root.lang = this.currentLanguage();
      root.dir = this.direction();
    });
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage failures (private mode / disabled storage); the language
      // still applies for the current session.
    }
  }

  /** Falls back to English whenever no valid preference is stored. */
  private readStoredLanguage(): Language {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "he") {
        return stored;
      }
    } catch {
      // Ignore storage failures and use the default.
    }
    return DEFAULT_LANGUAGE;
  }
}
