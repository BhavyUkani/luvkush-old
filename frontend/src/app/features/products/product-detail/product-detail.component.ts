import {
  Component, OnInit, OnDestroy, inject, signal, computed,
  ChangeDetectionStrategy, PLATFORM_ID, HostListener
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ProductApiService, Product, ProductVariant, Review } from "../../../core/services/product-api.service";
import { imageUrl } from "../../../shared/utils/image-url";
import { CartService } from "../../../core/services/cart.service";
import { WishlistService } from "../../../core/services/wishlist.service";
import { AuthService } from "../../../core/services/auth.service";
import { SeoService } from "../../../core/services/seo.service";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";

export type PdTab = "description" | "benefits" | "ingredients" | "how_to_use" | "shipping" | "returns" | "reviews";

export interface RecentProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  primary_image?: string;
  category_name?: string;
}

export interface Botanical {
  key: string;
  n: string;
  common: string;
  latin: string;
}

// "Amla Extract (Phyllanthus emblica)" → common + binomial.
const INGREDIENT_RE = /([^,()]+?)\s*\(([^)]+)\)/g;
// A real binomial is "Genus species" — separates botanicals from the
// functional base (Aqua, Cetyl Alcohol, Phenoxyethanol, and friends).
const BINOMIAL_RE = /^[A-Z][a-z]+ [a-z-]+$/;
const FORM_RE = /\s+(?:(?:Leaf|Flower|Berry|Root|Seed|Fruit|Bark|Essential)\s+)?(?:Extract|Powder|Oil|Water|Butter)$/i;
const GRADE_RE = /^(?:Organic|Virgin|Cold-Pressed|Pure|Refined)\s+/i;

@Component({
  selector: "lk-product-detail",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.scss"]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly productApi  = inject(ProductApiService);
  private readonly seoService  = inject(SeoService);
  private readonly platformId  = inject(PLATFORM_ID);
  private readonly destroy$    = new Subject<void>();

  readonly cart     = inject(CartService);
  readonly wishlist = inject(WishlistService);
  readonly auth     = inject(AuthService);

  // ── Data ───────────────────────────────────────────────────────
  product         = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  recentlyViewed  = signal<RecentProduct[]>([]);
  reviews         = signal<Review[]>([]);
  ratingSummary   = signal<any>(null);

  // ── Review form ────────────────────────────────────────────────
  reviewForm = signal({ rating: 0, title: '', body: '' });
  reviewHover = signal(0);
  reviewSubmitting = signal(false);
  reviewSubmitted  = signal(false);
  reviewError      = signal('');

  // ── UI State ───────────────────────────────────────────────────
  loading          = signal(true);
  reviewsLoading   = signal(false);
  addingToCart     = signal(false);
  addedToCart      = signal(false);
  selectedImageIdx = signal(0);
  selectedVariant  = signal<ProductVariant | null>(null);
  quantity         = signal(1);
  activeTab        = signal<PdTab>("description");
  openSections     = signal<Set<string>>(new Set(['description']));
  lightboxOpen     = signal(false);
  shareSuccess     = signal(false);
  fbtChecked       = signal<Set<number>>(new Set());

  readonly stars = [1, 2, 3, 4, 5];
  readonly imgUrl = imageUrl;

  // ── Computed ───────────────────────────────────────────────────
  allImages = computed(() => {
    const p = this.product();
    if (!p) return ["/assets/images/placeholder.webp"];
    const imgs: string[] = [];
    if (p.primary_image) imgs.push(imageUrl(p.primary_image));
    try {
      const extra = typeof p.images === "string"
        ? JSON.parse(p.images as string)
        : (p.images as string[]) ?? [];
      extra.forEach((img: string) => { if (img && !imgs.includes(img)) imgs.push(imageUrl(img)); });
    } catch { /* ignore */ }
    return imgs.length ? imgs : ["/assets/images/placeholder.webp"];
  });

  selectedImage = computed(() => this.allImages()[this.selectedImageIdx()] ?? "/assets/images/placeholder.webp");
  finalPrice    = computed(() => (this.product()?.price ?? 0) + (this.selectedVariant()?.price_modifier ?? 0));
  maxStock      = computed(() => this.selectedVariant()
    ? (this.selectedVariant()!.stock ?? 0)
    : (this.product()?.stock_quantity ?? 0));
  variantLabel  = computed(() => this.product()?.variants?.[0]?.name ?? "Option");

  discount = computed(() => {
    const p = this.product();
    if (!p?.mrp || p.mrp <= p.price) return 0;
    return Math.round((1 - p.price / p.mrp) * 100);
  });

  /** Named botanicals parsed out of the INCI list, for the specimen cards. */
  botanicals = computed<Botanical[]>(() => {
    const list = this.product()?.ingredients_list;
    if (!list) return [];
    const seen = new Set<string>();
    const out: Botanical[] = [];
    for (const m of list.matchAll(INGREDIENT_RE)) {
      const latin = m[2].trim();
      if (!BINOMIAL_RE.test(latin) || seen.has(latin)) continue;
      seen.add(latin);
      const common = m[1].trim().replace(GRADE_RE, '').replace(FORM_RE, '').trim();
      out.push({ key: latin, n: String(out.length + 1).padStart(2, '0'), common, latin });
    }
    return out;
  });

  /** Full INCI-style list for the fine-print block underneath the specimen cards. */
  ingredientsFull = computed(() => (this.product()?.ingredients_list ?? '').split(',').map(s => s.trim()).filter(Boolean));

  /** Benefits arrive as newline-separated lines; render each as a checklist row. */
  benefitsList = computed(() => (this.product()?.benefits ?? '').split('\n').map(s => s.trim()).filter(Boolean));

  /** How-to-use arrives pre-numbered ("1. …\n2. …"); strip the numbering, we draw our own. */
  howToSteps = computed(() => (this.product()?.how_to_use ?? '')
    .split('\n').map(s => s.trim().replace(/^\d+[.)]\s*/, '')).filter(Boolean));

  fbtProducts = computed(() => this.relatedProducts().slice(0, 2));

  fbtTotal = computed(() => {
    let total = 0;
    const p = this.product();
    if (p && this.fbtChecked().has(p.id)) total += Number(this.finalPrice());
    this.fbtProducts().forEach(r => { if (this.fbtChecked().has(r.id)) total += Number(r.price); });
    return total;
  });

  // ── Lifecycle ──────────────────────────────────────────────────
  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(p => this.loadProduct(p["slug"]));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = "";
    }
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.lightboxOpen()) this.closeLightbox();
  }

  // ── Data Loading ───────────────────────────────────────────────
  loadProduct(slug: string): void {
    this.loading.set(true);
    this.product.set(null);
    this.selectedImageIdx.set(0);
    this.selectedVariant.set(null);
    this.quantity.set(1);
    this.activeTab.set("description");

    this.productApi.getBySlug(slug).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const p = res.data ?? null;
        this.product.set(p);
        this.loading.set(false);
        if (!p) return;

        this.seoService.updateSeo({
          title: p.seo_title || p.name,
          description: p.seo_description || p.short_description || "",
          keywords: p.seo_keywords || "",
          image: p.primary_image,
          type: "product"
        });

        this.fbtChecked.set(new Set([p.id]));
        this.loadRelated(p.id);
        this.loadReviews(p.id);
        this.trackRecentlyViewed(p);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadRelated(id: number): void {
    this.productApi.getRelated(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const related = res.data ?? [];
        this.relatedProducts.set(related);
        if (related.length > 0) {
          this.fbtChecked.update(s => new Set([...s, related[0].id]));
        }
      },
      error: () => {}
    });
  }

  private loadReviews(id: number): void {
    this.reviewsLoading.set(true);
    this.productApi.getProductReviews(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.reviews.set(res.data ?? []);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false)
    });
    this.productApi.getRatingSummary(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => this.ratingSummary.set(res.data),
      error: () => {}
    });
  }

  // ── Gallery ────────────────────────────────────────────────────
  prevImage(): void {
    const len = this.allImages().length;
    this.selectedImageIdx.update(i => (i - 1 + len) % len);
  }

  nextImage(): void {
    const len = this.allImages().length;
    this.selectedImageIdx.update(i => (i + 1) % len);
  }

  openLightbox(): void {
    this.lightboxOpen.set(true);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = "hidden";
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = "";
  }

  // ── Variant ────────────────────────────────────────────────────
  selectVariant(v: ProductVariant): void {
    this.selectedVariant.set(this.selectedVariant()?.id === v.id ? null : v);
    this.quantity.set(1);
  }

  // ── Qty ────────────────────────────────────────────────────────
  increaseQty(): void { if (this.quantity() < this.maxStock()) this.quantity.update(q => q + 1); }
  decreaseQty(): void  { if (this.quantity() > 1) this.quantity.update(q => q - 1); }

  // ── Cart ───────────────────────────────────────────────────────
  addToCart(): void {
    const p = this.product();
    if (!p || this.maxStock() === 0) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.addingToCart.set(true);
    this.cart.addItem({
      productId: p.id, variantId: this.selectedVariant()?.id,
      name: p.name, variant: this.selectedVariant()?.value,
      price: this.finalPrice(), mrp: p.mrp,
      quantity: this.quantity(), image: p.primary_image ?? "", slug: p.slug
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
    const p = this.product();
    if (!p || this.maxStock() === 0) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.addingToCart.set(true);
    this.cart.addItem({
      productId: p.id, variantId: this.selectedVariant()?.id,
      name: p.name, variant: this.selectedVariant()?.value,
      price: this.finalPrice(), mrp: p.mrp,
      quantity: this.quantity(), image: p.primary_image ?? "", slug: p.slug
    }).subscribe({
      next: () => { this.addingToCart.set(false); this.router.navigate(["/checkout"]); },
      error: () => this.addingToCart.set(false)
    });
  }

  // ── FBT ────────────────────────────────────────────────────────
  toggleFbt(productId: number): void {
    this.fbtChecked.update(s => {
      const n = new Set(s);
      if (n.has(productId)) n.delete(productId); else n.add(productId);
      return n;
    });
  }

  addFbtToCart(): void {
    const p = this.product();
    if (!p) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.fbtChecked().has(p.id)) {
      this.cart.addItem({
        productId: p.id, name: p.name, price: this.finalPrice(),
        mrp: p.mrp, quantity: 1, image: p.primary_image ?? "", slug: p.slug
      }).subscribe();
    }
    this.fbtProducts().filter(r => this.fbtChecked().has(r.id)).forEach(r => {
      this.cart.addItem({
        productId: r.id, name: r.name, price: r.price,
        mrp: r.mrp ?? r.price, quantity: 1, image: r.primary_image ?? "", slug: r.slug
      }).subscribe();
    });
  }

  // ── Wishlist ───────────────────────────────────────────────────
  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(["/login"], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.wishlist.toggle(p).subscribe();
  }

  // ── Share ──────────────────────────────────────────────────────
  shareProduct(): void {
    const p = this.product();
    if (!p || !isPlatformBrowser(this.platformId)) return;
    const url = window.location.href;
    if ((navigator as any).share) {
      (navigator as any).share({ title: p.name, text: p.short_description ?? "", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.shareSuccess.set(true);
        setTimeout(() => this.shareSuccess.set(false), 2000);
      }).catch(() => {});
    }
  }

  toggleSection(section: string): void {
    this.openSections.update(set => {
      const newSet = new Set(set);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }

  isSectionOpen(section: string): boolean {
    return this.openSections().has(section);
  }

  // ── Reviews ────────────────────────────────────────────────────
  setTab(id: string): void { this.activeTab.set(id as PdTab); }

  scrollToReviews(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById("pd-reviews-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  // ── Recently Viewed ────────────────────────────────────────────
  private trackRecentlyViewed(p: Product): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem("lk_recently_viewed");
      let items: RecentProduct[] = raw ? JSON.parse(raw) : [];
      items = items.filter(i => i.id !== p.id);
      items.unshift({ id: p.id, name: p.name, slug: p.slug, price: p.price, mrp: p.mrp, primary_image: p.primary_image, category_name: p.category_name });
      items = items.slice(0, 6);
      localStorage.setItem("lk_recently_viewed", JSON.stringify(items));
      this.recentlyViewed.set(items.filter(i => i.id !== p.id).slice(0, 5));
    } catch { /* ignore */ }
  }
}