import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductApiService, Review } from '../../../core/services/product-api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'lk-hair-solution-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './hair-solution-detail.component.html',
  styleUrls: ['./hair-solution-detail.component.scss']
})
export class HairSolutionDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly productApi = inject(ProductApiService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);
  readonly imgUrl = imageUrl;

  item = signal<any>(null);
  product = signal<any>(null);
  loading = signal(true);
  loadingProduct = signal(true);
  addingToCart = signal(false);
  addedToCart = signal(false);
  quantity = signal(1);

  activeImage = signal('/assets/images/placeholder.webp');

  selectedSize = signal<string | null>(null);
  reviews = signal<Review[]>([]);
  ratingSummary = signal<any>(null);
  reviewsLoading = signal(false);
  reviewForm = signal({ rating: 0, title: '', body: '' });
  reviewHover = signal(0);
  reviewSubmitting = signal(false);
  reviewSubmitted  = signal(false);
  reviewError      = signal('');

  readonly stars = [1, 2, 3, 4, 5];

  allImages = computed(() => {
    const it = this.item();
    if (!it) return [];
    let imgs: string[] = [];
    try { imgs = JSON.parse(it.images || '[]'); } catch { imgs = []; }
    if (it.primary_image && !imgs.includes(it.primary_image)) imgs.unshift(it.primary_image);
    return imgs.length ? imgs : ['/assets/images/placeholder.webp'];
  });

  parsedSizes = computed(() => {
    const it = this.item();
    if (!it || !it.size_info) return [];
    return it.size_info.split(',').map((s: string) => s.trim()).filter(Boolean);
  });

  // The real differentiators when every piece in a range shares one studio
  // photo — shown as the fitting sheet, not buried in a spec table further
  // down the page.
  fittingSpecs = computed(() => {
    const it = this.item();
    if (!it) return [];
    const rows: { label: string; value: string }[] = [];
    if (it.hair_type)         rows.push({ label: 'Hair type',        value: it.hair_type });
    if (it.hair_source)       rows.push({ label: 'Hair source',      value: it.hair_source });
    if (it.cap_construction)  rows.push({ label: 'Base',             value: it.cap_construction });
    if (it.density)           rows.push({ label: 'Density',          value: it.density });
    if (it.maintenance_level) rows.push({ label: 'Maintenance',      value: it.maintenance_level });
    if (it.colour_info)       rows.push({ label: 'Shade',            value: it.colour_info });
    if (it.size_info)         rows.push({ label: 'Fit',              value: it.size_info });
    if (it.gender)            rows.push({ label: 'For',              value: this.genderLabel(it.gender) });
    return rows;
  });

  selectedVariant = computed(() => {
    const size = this.selectedSize();
    const prod = this.product();
    if (!size || !prod || !prod.variants) return null;
    return prod.variants.find((v: any) => v.value.toLowerCase() === size.toLowerCase()) || null;
  });

  finalPrice = computed(() => {
    const base = this.product() ? this.product().price : (this.item()?.base_price ?? 0);
    const modifier = this.selectedVariant()?.price_modifier ?? 0;
    return base + modifier;
  });

  discountPct = computed(() => {
    const it = this.item();
    if (!it?.mrp) return 0;
    const mrp = Number(it.mrp);
    const price = this.finalPrice();
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  });

  paymentMode = computed(() => this.product()?.payment_mode || this.item()?.payment_mode || 'full_cod');
  advanceAmount = computed(() => this.product()?.advance_amount || this.item()?.advance_amount || null);

  maxStock = computed(() => {
    const v = this.selectedVariant();
    if (v) return v.stock;
    return this.product()?.stock_quantity ?? 99;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      this.load(slug);
    });
  }

  // Matches the wording the wigs/patches listings already use for the same
  // field, rather than a raw title-case of the stored value ("male" ->
  // "Men's", not "Male").
  genderLabel(g: string): string {
    if (g === 'male') return "Men's";
    if (g === 'female') return "Women's";
    return 'Unisex';
  }

  increaseQty(): void { if (this.quantity() < this.maxStock()) this.quantity.update(q => q + 1); }
  decreaseQty(): void { if (this.quantity() > 1) this.quantity.update(q => q - 1); }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  addToCart(): void {
    const it = this.item();
    const p = this.product();
    if (!it) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.addingToCart.set(true);

    const productId = p ? p.id : it.id;
    const finalPrice = this.finalPrice();
    const mrp = p ? p.mrp : it.mrp;

    this.cart.addItem({
      productId: productId,
      variantId: this.selectedVariant()?.id,
      name: it.name,
      variant: this.selectedVariant()?.value,
      price: finalPrice,
      mrp: mrp || finalPrice,
      quantity: this.quantity(),
      image: it.primary_image ?? "",
      slug: it.slug
    }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.addedToCart.set(true);
        setTimeout(() => this.addedToCart.set(false), 3000);
      },
      error: () => this.addingToCart.set(false)
    });
  }

  buyNow(): void {
    const it = this.item();
    const p = this.product();
    if (!it) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.addingToCart.set(true);

    const productId = p ? p.id : it.id;
    const finalPrice = this.finalPrice();
    const mrp = p ? p.mrp : it.mrp;

    this.cart.addItem({
      productId: productId,
      variantId: this.selectedVariant()?.id,
      name: it.name,
      variant: this.selectedVariant()?.value,
      price: finalPrice,
      mrp: mrp || finalPrice,
      quantity: this.quantity(),
      image: it.primary_image ?? "",
      slug: it.slug
    }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.router.navigate(["/checkout"]);
      },
      error: () => this.addingToCart.set(false)
    });
  }

  scrollToReviews(): void {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.getElementById("hsd-reviews-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  }

  private loadReviews(id: number): void {
    this.reviewsLoading.set(true);
    this.productApi.getProductReviews(id).subscribe({
      next: (res: any) => {
        this.reviews.set(res.data ?? []);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false)
    });
    this.productApi.getRatingSummary(id).subscribe({
      next: (res) => this.ratingSummary.set(res.data),
      error: () => {}
    });
  }

  getRatingPct(star: number): number {
    const s = this.ratingSummary();
    if (!s?.total) return 0;
    const key = `${["", "one", "two", "three", "four", "five"][star]}_star`;
    return Math.round((s[key] ?? 0) / s.total * 100);
  }

  getStar(star: number): number {
    const s = this.ratingSummary();
    if (!s) return 0;
    return s[`${["", "one", "two", "three", "four", "five"][star]}_star`] ?? 0;
  }

  setReviewRating(r: number): void { this.reviewForm.update(f => ({ ...f, rating: r })); }
  setReviewTitle(v: string): void  { this.reviewForm.update(f => ({ ...f, title: v })); }
  setReviewBody(v: string): void   { this.reviewForm.update(f => ({ ...f, body: v })); }

  submitReview(): void {
    const f = this.reviewForm();
    const p = this.product();
    if (!p) return;
    if (!f.rating) { this.reviewError.set('Please select a star rating'); return; }
    if (!f.body.trim()) { this.reviewError.set('Please write your review'); return; }

    this.reviewSubmitting.set(true);
    this.reviewError.set('');
    this.productApi.submitReview({ product_id: p.id, rating: f.rating, title: f.title || undefined, body: f.body }).subscribe({
      next: () => {
        this.reviewSubmitting.set(false);
        this.reviewSubmitted.set(true);
        this.reviewForm.set({ rating: 0, title: '', body: '' });
        this.loadReviews(p.id);
      },
      error: (err: any) => {
        this.reviewSubmitting.set(false);
        this.reviewError.set(err?.error?.message || err?.userMessage || 'Failed to submit review');
      }
    });
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.loadingProduct.set(true);
    this.api.get<any>(`/hair-solutions/${slug}`).subscribe({
      next: (res: any) => {
        const it = res.data;
        this.item.set(it);
        this.loading.set(false);

        const sizesList = this.parsedSizes();
        if (sizesList.length > 0) {
          this.selectedSize.set(sizesList[0]);
        } else {
          this.selectedSize.set(null);
        }

        const imgs = this.allImages();
        this.activeImage.set(imgs[0] || '/assets/images/placeholder.webp');
        if (it?.name) this.title.setTitle(`${it.name} — Luv Kush Natural`);

        // Load the matching product by slug to retrieve correct product_id, price and stock_quantity
        this.api.get<any>(`/products/${slug}`).subscribe({
          next: (prodRes: any) => {
            const p = prodRes.data || null;
            this.product.set(p);
            this.loadingProduct.set(false);
            if (p) {
              this.loadReviews(p.id);
            }
          },
          error: () => {
            this.product.set(null);
            this.loadingProduct.set(false);
          }
        });
      },
      error: () => {
        this.item.set(null);
        this.loading.set(false);
        this.loadingProduct.set(false);
      }
    });
  }
}
