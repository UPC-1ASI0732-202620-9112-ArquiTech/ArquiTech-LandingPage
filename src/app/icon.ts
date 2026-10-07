import { Component, Input } from '@angular/core';
const PATHS: Record<string, string> = {
  facebook:
    'M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9h4Z',
  instagram:
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm9 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm1.5-5h.01',
  twitter:
    'M22 5.9a8.3 8.3 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.7 1 4.2 4.2 0 0 0-7.2 3.8A11.9 11.9 0 0 1 2.9 4.7a4.2 4.2 0 0 0 1.3 5.6 4.2 4.2 0 0 1-1.9-.5 4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.4 8.4 0 0 1 2 18.6a11.8 11.8 0 0 0 18.2-10A8.5 8.5 0 0 0 22 5.9Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  building: 'M4 21V7l8-4 8 4v14H4Zm5 0v-5h6v5M8 8h1m6 0h1M8 12h1m6 0h1',
  users:
    'M15 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3-3a4 4 0 0 1 0 8m2 3a4 4 0 0 1 3 4v2',
  box: 'm12 3 9 5v8l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v8M7 6l9 5',
  chart: 'M4 3v18h17M8 16v-5m5 5V7m5 9V4',
  check: 'm5 12 4 4L19 6',
  shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6',
  screen: 'M3 4h18v13H3V4Zm5 17h8m-4-4v4',
  phone: 'M7 2h10v20H7V2Zm4 17h2',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20',
  database:
    'M20 6c0 2-4 3-8 3s-8-1-8-3 4-3 8-3 8 1 8 3Zm0 0v12c0 2-4 3-8 3s-8-1-8-3V6m0 6c0 2 4 3 8 3s8-1 8-3',
  play: 'm9 6 9 6-9 6V6Z',
  link: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
};
@Component({
  selector: 'at-icon',
  standalone: true,
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path [attr.d]="path" [attr.fill]="filled ? \'currentColor\' : \'none\'" [attr.stroke]="filled ? \'none\' : \'currentColor\'" /></svg>',
  styles: [
    ':host{display:inline-flex;width:24px;height:24px;flex:none}svg{width:100%;height:100%}',
  ],
})
export class IconComponent {
  @Input() name = 'check';
  get filled() {
    return this.name === 'facebook' || this.name === 'twitter';
  }
  get path() {
    return PATHS[this.name] ?? PATHS['check'];
  }
}
