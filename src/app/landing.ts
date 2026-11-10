import { Component, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from './icon';
import { LanguageService } from './language';
import { LandingPlansComponent } from './landing-plans';
import { PRODUCT, TEAM } from './product';

@Component({
  selector: 'at-landing',
  standalone: true,
  imports: [TranslateModule, IconComponent, LandingPlansComponent],
  templateUrl: './landing.html',
})
export class LandingComponent {
  readonly fragmentBase = input('');
  readonly language = inject(LanguageService);
  readonly product = PRODUCT;
  readonly team = TEAM;
  readonly values = ['building', 'users', 'chart'];
  readonly benefits = ['box', 'users', 'shield'];
}
