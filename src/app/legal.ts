import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from './icon';
import { PRODUCT } from './product';
@Component({
  selector: 'at-legal',
  standalone: true,
  imports: [RouterLink, TranslateModule, IconComponent],
  templateUrl: './legal.html',
})
export class LegalComponent {
  readonly page = inject(ActivatedRoute).snapshot.data['page'] as string;
  readonly product = PRODUCT;
  readonly sections = Array.from({ length: this.page === 'terms' ? 17 : 6 }, (_, index) => index);
}
