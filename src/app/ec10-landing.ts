import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LandingComponent } from './landing';
import { LanguageService } from './language';

type Variant = 'A' | 'B';
type Segment = 'supervisor' | 'contractor';
interface FunnelEvent { type: string; variant: Variant; visitorId: string; at: string; segment: Segment | null; }

const VISITOR_KEY = 'arquitech-ec10-visitor-id';
const VARIANT_KEY = 'arquitech-ec10-assignment';
const EVENTS_KEY = 'arquitech-ec10-events';
export const DEMO_DESTINATION = 'contacto@arquitech.com';

/** EC10 experiment route. The public home route remains unchanged (control A). */
@Component({
  selector: 'at-ec10-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LandingComponent],
  templateUrl: './ec10-landing.html',
  styleUrl: './ec10-landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ec10LandingComponent {
  private readonly location = inject(Location);
  private readonly translate = inject(TranslateService);
  readonly destination = DEMO_DESTINATION;
  readonly copied = signal(false);

  get fragmentBase(): string {
    return this.location.prepareExternalUrl(this.location.path());
  }

  readonly variant: Variant;
  readonly visitorId: string;
  readonly segment = signal<Segment>('supervisor');
  readonly company = signal('');
  readonly contactEmail = signal('');
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly mailLink = signal('');
  readonly eventsCount = signal(0);

  constructor() {
    // Finding 2: the experiment opens in Spanish, its audience's language, unless the visitor chose one.
    inject(LanguageService).useIfNotChosen('es');
    const storedId = localStorage.getItem(VISITOR_KEY);
    this.visitorId = storedId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID() : 'ec10-' + Date.now().toString(36) + Math.random().toString(36).slice(2));
    if (!storedId) localStorage.setItem(VISITOR_KEY, this.visitorId);

    // Explicit test overrides are confined to this experimental route.
    const forced = new URLSearchParams(location.search).get('testVariant');
    const stored = localStorage.getItem(VARIANT_KEY);
    if (forced === 'A' || forced === 'B') {
      this.variant = forced;
    } else if (stored === 'A' || stored === 'B') {
      this.variant = stored;
    } else {
      const hash = Array.from(this.visitorId).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0);
      this.variant = hash % 2 === 0 ? 'A' : 'B';
      localStorage.setItem(VARIANT_KEY, this.variant);
    }
    this.track('view');
  }

  setSegment(value: Segment): void {
    this.segment.set(value);
    this.track('segment_selected');
  }

  private track(type: string): void {
    // Store interaction events locally; these do not confirm received requests.
    const entry: FunnelEvent = {
      type, variant: this.variant, visitorId: this.visitorId,
      at: new Date().toISOString(), segment: this.variant === 'B' ? this.segment() : null,
    };
    const previous = (() => {
      try {
        const parsed: unknown = JSON.parse(sessionStorage.getItem(EVENTS_KEY) ?? '[]');
        return Array.isArray(parsed) ? parsed as FunnelEvent[] : [];
      } catch {
        return [] as FunnelEvent[];
      }
    })();
    previous.push(entry);
    sessionStorage.setItem(EVENTS_KEY, JSON.stringify(previous));
    this.eventsCount.set(previous.length);
  }

  openRequest(): void {
    const company = this.company().trim();
    const email = this.contactEmail().trim();
    if (!company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set('ec10.form.error');
      return;
    }
    this.error.set('');
    this.submitting.set(true);
    this.track('mailto_intent');
    const t = (key: string, params?: Record<string, string>) => this.translate.instant(key, params) as string;
    const role = t('ec10.mail.' + this.segment());
    const subject = encodeURIComponent(t('ec10.mail.subject', { segment: role }));
    const message = encodeURIComponent(
      t('ec10.mail.intro') + '\n' +
      t('ec10.mail.segment') + ': ' + role + '\n' +
      t('ec10.mail.company') + ': ' + company + '\n' +
      t('ec10.mail.email') + ': ' + email + '\n',
    );
    // Opening mailto does not prove message delivery or a qualified commercial lead.
    const href = 'mailto:' + DEMO_DESTINATION + '?subject=' + subject + '&body=' + message;
    this.mailLink.set(href);
    location.href = href;
    this.submitting.set(false);
  }

  /** Copies the destination for visitors who use webmail (finding 13). */
  copyDestination(): void {
    const done = () => this.copied.set(true);
    try {
      void navigator.clipboard?.writeText(DEMO_DESTINATION).then(done, done);
    } catch {
      done();
    }
    this.track('copy_destination');
  }
}
