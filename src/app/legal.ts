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
  readonly sections = [0, 1, 2, 3, 4, 5];
}
