import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from './icon';
import { LanguageService } from './language';
import { PRODUCT, TEAM } from './product';

@Component({
  selector: 'at-landing',
  standalone: true,
  imports: [TranslateModule, IconComponent],
  templateUrl: './landing.html',
})
export class LandingComponent {
  readonly language = inject(LanguageService);
  readonly product = PRODUCT;
  readonly team = TEAM;
  readonly values = ['building', 'users', 'chart'];
  readonly benefits = ['box', 'users', 'shield'];
}
