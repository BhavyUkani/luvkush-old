import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, computed, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductApiService, Product } from '../../../../core/services/product-api.service';
import { imageUrl } from '../../../../shared/utils/image-url';

/** Dwell time on each specimen, in ms. Mirrored by the dot fill animation. */
const DWELL_MS = 7000;

/** Most annotations the plate can carry before it stops reading as a plate. */
const MAX_NOTES = 6;

/** One annotated botanical on the plate. */
export interface Botanical {
  /** Stable across a product but unique per product, so a swap re-runs the draw-in. */
  key: string;
  n: string;        // '01'
  common: string;   // 'Bhringraj'
  latin: string;    // 'Eclipta alba'
}

// "Bhringraj Leaf Extract (Eclipta alba)" → common + binomial.
const INGREDIENT_RE = /([^,()]+?)\s*\(([^)]+)\)/g;

// A real binomial is "Genus species" — this is what separates the botanicals
// from the functional base (Aqua, Cocamidopropyl Betaine, and friends).
const BINOMIAL_RE = /^[A-Z][a-z]+ [a-z-]+$/;

// Trailing form words. Stripping them leaves the plant, which is what a plate labels.
const FORM_RE = /\s+(?:(?:Leaf|Flower|Berry|Root|Seed|Fruit|Bark|Essential)\s+)?(?:Extract|Powder|Oil|Water|Butter)$/i;
const GRADE_RE = /^(?:Organic|Virgin|Cold-Pressed|Pure|Refined)\s+/i;

@Component({
  selector: 'lk-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  host: {
    '(pointermove)': 'onPointerMove($event)',
    '(pointerleave)': 'resetParallax()'
  }
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly productApi = inject(ProductApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private timer?: ReturnType<typeof setInterval>;

  readonly imgUrl = imageUrl;
  readonly dwellMs = DWELL_MS;

  readonly products = signal<Product[]>([]);
  readonly index = signal(0);
  readonly loading = signal(true);

  /** Pointer offset from centre, -1..1. Drives the parallax layers. */
  readonly px = signal(0);
  readonly py = signal(0);

  readonly current = computed(() => this.products()[this.index()] ?? null);

  /** Plate number, following the rotation. */
  readonly plateNo = computed(() => String(this.index() + 1).padStart(2, '0'));

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

  /** Every botanical the current formula declares, capped for the layout. */
  readonly botanicals = computed<Botanical[]>(() => {
    const p = this.current();
    if (!p?.ingredients_list) return [];

    const seen = new Set<string>();
    const out: Botanical[] = [];

    for (const m of p.ingredients_list.matchAll(INGREDIENT_RE)) {
      const latin = m[2].trim();
      if (!BINOMIAL_RE.test(latin) || seen.has(latin)) continue;
      seen.add(latin);

      const common = m[1].trim().replace(GRADE_RE, '').replace(FORM_RE, '').trim();
      out.push({
        key: `${p.id}-${latin}`,
        n: String(out.length + 1).padStart(2, '0'),
        common: common || m[1].trim(),
        latin
      });
      if (out.length === MAX_NOTES) break;
    }
    return out;
  });

  /**
   * The plate reads outward from the specimen, so the left column runs top-down
   * and takes the odd one when the count is uneven.
   */
  readonly notesLeft  = computed(() => this.botanicals().slice(0, Math.ceil(this.botanicals().length / 2)));
  readonly notesRight = computed(() => this.botanicals().slice(Math.ceil(this.botanicals().length / 2)));

  // Parallax layers. Depth reads from the spread: the ambient wash drifts with
  // the pointer, the specimen barely moves, the annotations lead slightly.
  readonly washShift     = computed(() => this.shift(-20, -13));
  readonly specimenShift = computed(() => this.shift(6, 4));

  private shift(ax: number, ay: number): string {
    return `translate3d(${(this.px() * ax).toFixed(2)}px, ${(this.py() * ay).toFixed(2)}px, 0)`;
  }

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
    this.startRotation();   // restart the dwell after a manual pick
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.motionAllowed()) return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    this.px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    this.py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }

  resetParallax(): void {
    this.px.set(0);
    this.py.set(0);
  }

  private motionAllowed(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  private startRotation(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.timer) clearInterval(this.timer);
    if (this.products().length < 2) return;
    if (!this.motionAllowed()) return;

    this.timer = setInterval(() => {
      this.index.update(i => (i + 1) % this.products().length);
    }, DWELL_MS);
  }
}
