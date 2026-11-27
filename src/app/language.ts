import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

const STORAGE_KEY = 'arquitech-language';
type Language = 'es' | 'en';

/**
 * Spanish by default for the Peruvian audience; English only when the browser asks for it.
 * The visitor's explicit choice is remembered (audit finding 14).
 */
export function initialLanguage(saved: string | null, browserLanguages: readonly string[] = []): Language {
  if (saved === 'es' || saved === 'en') return saved;
  const first = browserLanguages.find(Boolean)?.toLowerCase() ?? '';
  return first.startsWith('en') ? 'en' : 'es';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  readonly current = signal<Language>('es');
  private chosen = false;
  private readonly subscription: Subscription;
  constructor() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.subscription = this.translate.onLangChange.subscribe((event) => {
      this.current.set(event.lang === 'en' ? 'en' : 'es');
      this.document.documentElement.lang = this.current();
      this.document.title = event.translations['meta']?.title ?? 'ArquiTech';
      this.document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', event.translations['meta']?.description ?? 'ArquiTech');
    });
    let saved: string | null = null;
    try {
      saved = this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? null;
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
    this.chosen = saved === 'es' || saved === 'en';
    const navigator = this.document.defaultView?.navigator;
    const languages = navigator ? [...(navigator.languages ?? []), navigator.language] : [];
    this.translate.use(initialLanguage(saved, languages));
  }

  /** Uses a language for this view without overriding a choice the visitor already made. */
  useIfNotChosen(language: Language) {
    if (!this.chosen && this.current() !== language) this.translate.use(language);
  }
  toggle() {
    const next = this.current() === 'es' ? 'en' : 'es';
    this.translate.use(next);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, next);
      this.chosen = true;
    } catch {
      /* Language still works without persistence. */
    }
  }
  destroy() {
    this.subscription.unsubscribe();
  }
}
