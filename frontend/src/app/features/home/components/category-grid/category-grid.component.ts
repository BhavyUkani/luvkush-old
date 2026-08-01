import {
  Component, OnInit, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductApiService, Category } from '../../../../core/services/product-api.service';
import { imageUrl } from '../../../../shared/utils/image-url';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/** Editorial line shown under each category name, keyed by slug. */
const BLURBS: Record<string, string> = {
  'hair-oil':     'Slow-infused, cold-pressed, never diluted.',
  'shampoo':      'Sulphate-free cleansers that respect your scalp.',
  'hair-mask':    'Deep weekly treatments for tired hair.',
  'soap':         'Hand-cut bars, cured the traditional way.',
  'face-care':    'Kumkumadi, aloe and sandalwood classics.',
  'men-wigs':     'Undetectable lace fronts, custom fitted.',
  'ladies-wigs':  'Virgin Indian hair, part it anywhere.',
  'hair-patches': 'Instant density where you need it.',
};

@Component({
  selector: 'lk-category-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RevealDirective],
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.scss']
})
export class CategoryGridComponent implements OnInit {
  private readonly productApi = inject(ProductApiService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly imgUrl = imageUrl;
  readonly skeletons = [0, 1, 2, 3, 4];

  ngOnInit(): void {
    this.productApi.getCategories().subscribe({
      next: (res) => {
        // Care ranges only — hair systems get their own dedicated sections below.
        const wanted = ['hair-oil', 'shampoo', 'hair-mask', 'soap', 'face-care'];
        const all = res.data ?? [];
        const ordered = wanted
          .map(slug => all.find(c => c.slug === slug))
          .filter((c): c is Category => !!c);

        this.categories.set(ordered.length ? ordered : all.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  blurb(slug: string): string {
    return BLURBS[slug] ?? '';
  }
}
