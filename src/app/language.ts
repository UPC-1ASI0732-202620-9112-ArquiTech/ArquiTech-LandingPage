import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  readonly current = signal<'es' | 'en'>('es');
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
      saved = this.document.defaultView?.localStorage.getItem('arquitech-language') ?? null;
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
    this.translate.use(saved === 'en' ? 'en' : 'es');
  }
  toggle() {
    const next = this.current() === 'es' ? 'en' : 'es';
    this.translate.use(next);
    try {
      this.document.defaultView?.localStorage.setItem('arquitech-language', next);
    } catch {
      /* Language still works without persistence. */
    }
  }
  destroy() {
    this.subscription.unsubscribe();
  }
}
