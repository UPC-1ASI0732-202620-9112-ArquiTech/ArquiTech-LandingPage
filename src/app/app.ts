import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from './language';
import { IconComponent } from './icon';
import { PRODUCT } from './product';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, TranslateModule, IconComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements OnDestroy {
  readonly language = inject(LanguageService);
  readonly product = PRODUCT;
  private readonly document = inject(DOCUMENT);
  menuOpen = false;
  scrolled = false;
  readonly navigation = ['value', 'benefits', 'product', 'modes', 'team'];
  constructor() {
    inject(ViewportScroller).setOffset([0, 100]);
  }
  @HostListener('window:scroll') onScroll() {
    this.scrolled = (this.document.defaultView?.scrollY ?? 0) > 12;
  }
  @HostListener('window:resize') onResize() {
    if ((this.document.defaultView?.innerWidth ?? 0) > 1100) this.closeMenu();
  }
  @HostListener('document:keydown.escape') onEscape() {
    if (this.menuOpen) {
      this.closeMenu();
      this.document.getElementById('menu-toggle')?.focus();
    }
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  closeMenu() {
    this.menuOpen = false;
  }
  ngOnDestroy() {
    this.language.destroy();
  }
}
