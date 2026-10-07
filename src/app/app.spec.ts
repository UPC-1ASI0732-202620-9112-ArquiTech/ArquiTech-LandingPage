import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app';
import { LanguageService } from './language';
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
    language.toggle();
    expect(language.current()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('arquitech-language')).toBe('en');
    language.destroy();
  });

  it('renders the legal route with the shared shell', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl('/terms');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.legal-page section').length).toBe(6);
    expect(fixture.nativeElement.querySelector('header')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('footer')).toBeTruthy();
  });
});
