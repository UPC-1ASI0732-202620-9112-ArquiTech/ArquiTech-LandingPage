import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Ec10LandingComponent } from './ec10-landing';

describe('EC10 - landing completa y personalización A/B', () => {
  const sections = ['home', 'value', 'benefits', 'product', 'plans', 'team', 'trust', 'faq'];
  const assertFullPage = (el: HTMLElement) => {
    for (const id of sections) expect(el.querySelector('at-landing #' + id)).withContext(id).toBeTruthy();
    expect(el.querySelector('#team .team-row')).toBeTruthy();
    expect(el.querySelector('#faq .faq-list')).toBeTruthy();
    expect(el.querySelector('.final-cta')).toBeTruthy();
  };
  beforeEach(async () => {
    localStorage.removeItem('arquitech-ec10-visitor-id');
    localStorage.removeItem('arquitech-ec10-assignment');
    sessionStorage.removeItem('arquitech-ec10-events');
    await TestBed.configureTestingModule({
      imports: [Ec10LandingComponent, TranslateModule.forRoot()],
    }).compileComponents();
  });
  afterEach(() => {
    localStorage.removeItem('arquitech-ec10-visitor-id');
    localStorage.removeItem('arquitech-ec10-assignment');
    sessionStorage.removeItem('arquitech-ec10-events');
  });

  it('A mantiene la landing íntegra y su CTA general', () => {
    localStorage.setItem('arquitech-ec10-assignment', 'A');
    const f = TestBed.createComponent(Ec10LandingComponent);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(f.componentInstance.variant).toBe('A');
    assertFullPage(el);
    expect(el.querySelector('.ec10-segments')).toBeFalsy();
    expect(el.querySelector('.ec10-form')).toBeFalsy();
    expect(el.querySelector('.ec10-benefit')).toBeFalsy();
    expect(el.querySelector('#plans .mode-card .button')?.getAttribute('href')).toContain('#contact');
  });

  it('B mantiene toda la página y personaliza hero, beneficio y CTA', () => {
    localStorage.setItem('arquitech-ec10-assignment', 'B');
    const f = TestBed.createComponent(Ec10LandingComponent);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(f.componentInstance.variant).toBe('B');
    assertFullPage(el);
    expect(el.querySelector('.ec10-form')).toBeTruthy();
    expect(el.querySelector('#home h1')?.textContent).toContain('Menos tiempo registrando');
    expect(el.querySelector('.ec10-benefit')?.textContent).toContain('Menos tiempo registrando');
    expect(el.querySelector('#home .actions a')?.getAttribute('href')).toContain('#demo');
    expect(el.querySelector('#plans .mode-card .button')?.getAttribute('href')).toContain('#demo');
    expect(el.querySelector('.final-cta a')?.getAttribute('href')).toContain('#demo');
    const contractor = Array.from(el.querySelectorAll('.ec10-segments button')).find(button =>
      button.textContent?.includes('contratante')) as HTMLButtonElement | undefined;
    expect(contractor).toBeDefined();
    contractor!.click();
    f.detectChanges();
    expect(el.querySelector('#home h1')?.textContent).toContain('Consulta el avance');
    expect(el.querySelector('.ec10-benefit')?.textContent).toContain('Consulta el avance');
    expect(el.querySelector('.ec10-segments button.is-active')?.textContent).toContain('contratante');
    assertFullPage(el);
    const events = JSON.parse(sessionStorage.getItem('arquitech-ec10-events') ?? '[]') as { type: string }[];
    expect(events.map(event => event.type)).toContain('segment_selected');
  });

  it('B no registra una solicitud con correo inválido', () => {
    localStorage.setItem('arquitech-ec10-assignment', 'B');
    const f = TestBed.createComponent(Ec10LandingComponent);
    f.detectChanges();
    f.componentInstance.company.set('Obra de referencia');
    f.componentInstance.contactEmail.set('correo-no-valido');
    f.componentInstance.openRequest();
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('correo electrónico válido');
    expect(el.querySelector('.ec10-mail-link')).toBeFalsy();
    const events = JSON.parse(sessionStorage.getItem('arquitech-ec10-events') ?? '[]') as { type: string }[];
    expect(events.filter(event => event.type === 'mailto_intent').length).toBe(0);
  });

  it('conserva el identificador, la variante y las secciones entre instancias', () => {
    localStorage.setItem('arquitech-ec10-assignment', 'B');
    const f1 = TestBed.createComponent(Ec10LandingComponent);
    f1.detectChanges();
    const id = f1.componentInstance.visitorId;
    f1.destroy();
    const f2 = TestBed.createComponent(Ec10LandingComponent);
    f2.detectChanges();
    expect(f2.componentInstance.visitorId).toBe(id);
    expect(f2.componentInstance.variant).toBe('B');
    assertFullPage(f2.nativeElement);
    const events = JSON.parse(sessionStorage.getItem('arquitech-ec10-events') ?? '[]') as { type: string }[];
    expect(events.filter(event => event.type === 'view').length).toBe(2);
  });
});
