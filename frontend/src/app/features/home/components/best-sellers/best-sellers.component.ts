import {
  Component, OnInit, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductApiService, Product } from '../../../../core/services/product-api.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

type TabKey = 'best' | 'new' | 'featured';

@Component({
  selector: 'lk-best-sellers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ProductCardComponent, RevealDirective],
  templateUrl: './best-sellers.component.html',
  styleUrls: ['./best-sellers.component.scss']
})
export class BestSellersComponent implements OnInit {
  private readonly productApi = inject(ProductApiService);

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'best',     label: 'Bestsellers' },
    { key: 'new',      label: 'New arrivals' },
    { key: 'featured', label: 'Editor’s picks' },
  ];

  readonly active = signal<TabKey>('best');
  readonly loading = signal(true);
  readonly skeletons = [0, 1, 2, 3];

  /** Each tab is fetched once and then cached, so switching is instant. */
  private readonly cache = new Map<TabKey, Product[]>();
  readonly products = signal<Product[]>([]);

  ngOnInit(): void {
    this.load('best');
  }

  select(key: TabKey): void {
    if (key === this.active()) return;
    this.active.set(key);

    const cached = this.cache.get(key);
    if (cached) {
      this.products.set(cached);
      return;
    }
    this.load(key);
  }

  private load(key: TabKey): void {
    this.loading.set(true);

    const req =
      key === 'new'      ? this.productApi.getNewArrivals(8) :
      key === 'featured' ? this.productApi.getFeatured(8) :
                           this.productApi.getBestSellers(8);

    req.subscribe({
      next: (res) => {
        const data = res.data ?? [];
        this.cache.set(key, data);
        // Ignore a response that lost the race to a newer tab selection
        if (this.active() === key) {
          this.products.set(data);
          this.loading.set(false);
        }
      },
      error: () => {
        if (this.active() === key) {
          this.products.set([]);
          this.loading.set(false);
        }
      }
    });
  }
}
