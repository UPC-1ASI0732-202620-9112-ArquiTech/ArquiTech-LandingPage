import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Ec10LandingComponent } from './ec10-landing';

describe('EC10 - A/B de Landing Page (navegador)', () => {
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

  it('mantiene el recorrido A existente si el visitante quedó asignado al control', () => {
    localStorage.setItem('arquitech-ec10-assignment', 'A');
    const fixture = TestBed.createComponent(Ec10LandingComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.variant).toBe('A');
    expect(fixture.nativeElement.querySelector('at-landing')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.ec10-form')).toBeFalsy();
  });

  it('muestra el beneficio correcto para supervisor y contratante en B', () => {
    localStorage.setItem('arquitech-ec10-assignment', 'B');
    const fixture = TestBed.createComponent(Ec10LandingComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.variant).toBe('B');
    expect(el.querySelector('.ec10-form')).toBeTruthy();
    expect(el.textContent).toContain('Menos tiempo registrando');
    const contractor = Array.from(el.querySelectorAll('.ec10-segments button')).find((b) =>
      b.textContent?.includes('contratante'),
    ) as HTMLButtonElement | undefined;
    expect(contractor).toBeDefined();
    contractor!.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Consulta el avance de tu obra');
    expect(el.querySelector('.ec10-segments button.is-active')?.textContent).toContain('contratante');
    const events = JSON.parse(sessionStorage.getItem('arquitech-ec10-events') ?? '[]') as { type: string }[];
    expect(events.map((event) => event.type)).toContain('segment_selected');
  });

  it('conserva el identificador y la variante durante dos cargas del componente', () => {
    localStorage.setItem('arquitech-ec10-assignment', 'B');
    const first = TestBed.createComponent(Ec10LandingComponent);
    first.detectChanges();
    const assignedId = first.componentInstance.visitorId;
    first.destroy();

    const second = TestBed.createComponent(Ec10LandingComponent);
    second.detectChanges();
    expect(second.componentInstance.variant).toBe('B');
    expect(second.componentInstance.visitorId).toBe(assignedId);
    const views = JSON.parse(sessionStorage.getItem('arquitech-ec10-events') ?? '[]') as { type: string }[];
    expect(views.filter((event) => event.type === 'view').length).toBe(2);
  });
});
