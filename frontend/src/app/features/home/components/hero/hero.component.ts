import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, computed, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductApiService, Product } from '../../../../core/services/product-api.service';
import { imageUrl } from '../../../../shared/utils/image-url';

@Component({
  selector: 'lk-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly productApi = inject(ProductApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private timer?: ReturnType<typeof setInterval>;

  readonly imgUrl = imageUrl;

  readonly products = signal<Product[]>([]);
  readonly index = signal(0);
  readonly loading = signal(true);

  /** The product currently in the spotlight frame. */
  readonly current = computed(() => this.products()[this.index()] ?? null);

  readonly saving = computed(() => {
    const p = this.current();
    if (!p) return 0;
    return Math.max(0, Number(p.mrp) - Number(p.price));
  });

  readonly savingPct = computed(() => {
    const p = this.current();
    if (!p || !Number(p.mrp)) return 0;
    return Math.round((this.saving() / Number(p.mrp)) * 100);
  });

  ngOnInit(): void {
    this.productApi.getBestSellers(4).subscribe({
      next: (res) => {
        this.products.set(res.data ?? []);
        this.loading.set(false);
        this.startRotation();
      },
      error: () => this.loading.set(false)
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  select(i: number): void {
    this.index.set(i);
    this.startRotation();   // restart the dwell time after a manual pick
  }

  private startRotation(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.timer) clearInterval(this.timer);
    if (this.products().length < 2) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    this.timer = setInterval(() => {
      this.index.update(i => (i + 1) % this.products().length);
    }, 6000);
  }
}
