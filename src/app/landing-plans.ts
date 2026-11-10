import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from './icon';

@Component({
  selector: 'section[at-landing-plans]',
  standalone: true,
  imports: [TranslateModule, IconComponent],
  templateUrl: './landing-plans.html',
})
export class LandingPlansComponent {
  readonly contactHref = input.required<string>();
}
