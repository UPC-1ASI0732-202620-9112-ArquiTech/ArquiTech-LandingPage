import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LandingComponent } from './landing';

type Variant = 'A' | 'B';
type Segment = 'supervisor' | 'contractor';
interface FunnelEvent { type: string; variant: Variant; visitorId: string; at: string; segment: Segment | null; }

const VISITOR_KEY = 'arquitech-ec10-visitor-id';
const VARIANT_KEY = 'arquitech-ec10-assignment';
const EVENTS_KEY = 'arquitech-ec10-events';

/** EC10 experiment route. The public home route remains unchanged (control A). */
@Component({
  selector: 'at-ec10-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, LandingComponent],
  templateUrl: './ec10-landing.html',
  styleUrl: './ec10-landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ec10LandingComponent {
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
    // Local-only instrumentation for simulated visits: never claims real leads.
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
      this.error.set('Escribe una organización y un correo electrónico válido.');
      return;
    }
    this.error.set('');
    this.submitting.set(true);
    this.track('mailto_intent');
    const subject = encodeURIComponent('Solicitud de demostración ArquiTech - ' + this.segment());
    const message = encodeURIComponent(
      'Solicito información sobre ArquiTech.\n' +
      'Segmento: ' + (this.segment() === 'supervisor' ? 'Supervisor de obra' : 'Contratante') + '\n' +
      'Organización: ' + company + '\n' +
      'Correo de contacto: ' + email + '\n',
    );
    // Opening mailto does not prove message delivery or a qualified commercial lead.
    const href = 'mailto:contacto@arquitech.com?subject=' + subject + '&body=' + message;
    this.mailLink.set(href);
    location.href = href;
    this.submitting.set(false);
  }
}
