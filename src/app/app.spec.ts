import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app';
import { LanguageService, initialLanguage } from './language';
import { routes } from './app.routes';

describe('ArquiTech landing shell', () => {
  beforeEach(async () => {
    localStorage.removeItem('arquitech-language');
    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });
  afterEach(() => localStorage.removeItem('arquitech-language'));

  it('renders the landing route inside the shared header and footer', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('header nav')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('main #home h1')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('footer a[href="/privacy"]')).toBeTruthy();
  });

  it('persists the language and updates the document language', () => {
    const language = TestBed.inject(LanguageService);
    const next = language.current() === 'es' ? 'en' : 'es';
    language.toggle();
    expect(language.current()).toBe(next);
    expect(document.documentElement.lang).toBe(next);
    expect(localStorage.getItem('arquitech-language')).toBe(next);
    language.destroy();
  });

  it('uses Spanish by default and English only when the browser asks for it (finding 14)', () => {
    expect(initialLanguage(null, [])).toBe('es');
    expect(initialLanguage(null, ['es-PE', 'en'])).toBe('es');
    expect(initialLanguage(null, ['en-US'])).toBe('en');
    expect(initialLanguage('es', ['en-US'])).toBe('es');
    expect(initialLanguage('en', ['es-PE'])).toBe('en');
  });

  it('shows an explicit sign-in action and no generic social links (findings 15 and 22)', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.nav-cta')?.textContent).toContain('nav.signIn');
    expect(el.querySelector('.nav-signin')?.textContent).toContain('nav.signIn');
    expect(el.querySelector('footer a[href*="facebook.com"], footer a[href*="instagram.com"], footer a[href*="x.com"]')).toBeNull();
  });

  it('serves the experiment on a Spanish route and keeps the old link (finding 2)', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/experiment/ec10?testVariant=B');
    expect(router.url).toBe('/experimento/ec10?testVariant=B');
  });

  it('hides the placeholder team video (finding 21)', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.team-video-space')).toBeNull();
    expect(fixture.nativeElement.querySelector('#team .purpose')).toBeTruthy();
  });

  it('renders the legal route with the shared shell', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl('/terms');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.legal-page section').length).toBe(17);
    expect(fixture.nativeElement.querySelector('header')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('footer')).toBeTruthy();
  });
});
