import {
  Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ProductApiService, Product, Category, ProductFilters } from "../../../core/services/product-api.service";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { SeoService } from "../../../core/services/seo.service";
import { imageUrl } from "../../../shared/utils/image-url";

@Component({
  selector: "lk-collection",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  templateUrl: "./collection.component.html",
  styleUrls: ["./collection.component.scss"]
})
export class CollectionComponent implements OnInit, OnDestroy {
  private readonly productApi = inject(ProductApiService);
  private readonly seo        = inject(SeoService);
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly destroy$   = new Subject<void>();

  readonly imgUrl = imageUrl;

  products       = signal<Product[]>([]);
  categories     = signal<Category[]>([]);
  loading        = signal(true);
  refineOpen     = signal(false);
  sortOpen       = signal(false);
  viewMode       = signal<"grid" | "list">("grid");
  totalProducts  = signal(0);
  currentPage    = signal(1);
  totalPages     = signal(1);

  // A signal, not a plain property: currentCategory below is a computed()
  // that reads it, and computed() only re-runs when a signal dependency
  // changes. A plain property here would leave currentCategory (and the
  // page <h1>) stuck showing whatever category was selected when
  // `categories` last loaded — this bit the original sidebar too, just
  // less visibly, since the old radio list didn't rely on the title to
  // show selection.
  selectedCategory = signal("");
  // Also a signal, for the same reason: the sort control was rebuilt as a
  // custom button + menu (native <select> rendered blank on some Windows
  // browsers — appearance:none plus a custom arrow is a known landmine for
  // native widget theming), and its visible label is a computed() reading
  // this value.
  sortBy           = signal("created_at:DESC");
  minPrice         = "";
  maxPrice         = "";
  inStockOnly      = false;
  ratingMin        = 0;
  searchQuery      = "";

  readonly PAGE_SIZE = 12;
  readonly SORT_OPTIONS = [
    { value: "created_at:DESC", label: "Newest First" },
    { value: "sales_count:DESC", label: "Best Selling" },
    { value: "price:ASC",        label: "Price: Low to High" },
    { value: "price:DESC",       label: "Price: High to Low" },
    { value: "rating_avg:DESC",  label: "Highest Rated" }
  ];

  readonly RATING_OPTIONS = [
    { value: 4, label: "4★ & above" },
    { value: 3, label: "3★ & above" },
    { value: 2, label: "2★ & above" }
  ];

  currentCategory = computed(() =>
    this.categories().find(c => c.slug === this.selectedCategory()) ?? null
  );

  currentSortLabel = computed(() =>
    this.SORT_OPTIONS.find(o => o.value === this.sortBy())?.label ?? "Sort"
  );

  // Categories with no products (hair systems live in a separate table, not
  // `products`) don't get a rail tile at all — there's nothing to filter to,
  // so a tile for one would only exist to be clicked and immediately explain
  // why it has nothing to show. The nav's own "Hair Wigs" / "Hair Patches"
  // links already cover discovery; this rail is for filtering this page's
  // own catalogue.
  railCategories = computed(() =>
    this.categories().filter(c => (c.product_count ?? 0) > 0)
  );

  // The "All Products" tile's count must stay the grand total regardless of
  // which filters are active — totalProducts() moves with the current
  // filter/search, which would make the tile show a misleading small number
  // while a different category or search is selected.
  grandTotal = computed(() =>
    this.railCategories().reduce((sum, c) => sum + (c.product_count ?? 0), 0)
  );

  isHairSystemCategory(cat: Category): boolean {
    return (cat.product_count ?? 0) === 0;
  }

  // Drives the empty state's redirect CTA when the selected category is one
  // of these — the only place navigation to another page can originate from,
  // and only on an explicit click there, not from the tile itself.
  selectedIsHairSystem = computed(() => {
    const cat = this.currentCategory();
    return cat ? this.isHairSystemCategory(cat) : false;
  });

  // Same slug-sniffing product-card.component.ts already uses to route a
  // product into /hair-wigs vs /hair-patches — mirrored here so a category
  // added later with "wig" or "patch" in its slug routes correctly without
  // another hardcoded list to maintain.
  hairSystemRoute(cat: Category): string {
    const slug = cat.slug.toLowerCase();
    if (slug.includes("patch")) return "/hair-patches";
    if (slug.includes("wig")) return "/hair-wigs";
    return "/shop";
  }

  // Same copy the home page's hair-solutions sections already use for these
  // exact ranges — reused rather than invented, so the claim is identical
  // wherever it appears rather than being worded twice.
  hairSystemBlurb(cat: Category): string {
    return this.hairSystemRoute(cat) === "/hair-patches"
      ? "Seamless coverage and instant density, cut and shaped to your parting."
      : "Undetectable hairlines in 100% human Remy hair, fitted to your head shape.";
  }

  // men-wigs / ladies-wigs / hair-patches carry no image_url in the API, so
  // imgUrl() would fall through to the generic "No Image" placeholder — these
  // three real product photos are already used for the same ranges on the
  // home page's hair-solutions section. Every tile calls this (not just
  // these three), so a category that never gets an image_url set later
  // still shows something real instead of the placeholder.
  tileImage(cat: Category): string {
    if (cat.image_url) return this.imgUrl(cat.image_url);
    const slug = cat.slug.toLowerCase();
    if (slug.includes("patch")) return "/assets/images/hair_patch.png";
    if (slug.includes("wig")) return "/assets/images/premium_hair_wig.png";
    return this.imgUrl(null);   // generic "No Image" placeholder
  }

  pageRange = computed(() => {
    const total = this.totalPages();
    const cur   = this.currentPage();
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) range.push(i);
    return range;
  });

  // A plain method, not computed(): minPrice/maxPrice/inStockOnly are plain
  // properties (they're two-way [(ngModel)] bound, which doesn't work
  // against a WritableSignal without switching to the [ngModel]+
  // (ngModelChange) form), so a computed() here would have the same
  // stale-read problem selectedCategory had above. This is read from the
  // template on every change-detection pass, which OnPush still runs for
  // the (click)/(change)/(input) events that mutate these fields.
  activeFilterCount(): number {
    let n = 0;
    if (this.minPrice || this.maxPrice) n++;
    if (this.inStockOnly) n++;
    if (this.ratingMin > 0) n++;
    return n;
  }

  ngOnInit(): void {
    this.productApi.getCategories().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.categories.set(res.data ?? []);
    });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params["slug"]) this.selectedCategory.set(params["slug"]);
      this.loadProducts();
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(qp => {
      if (qp["search"]) this.searchQuery = qp["search"];
      if (qp["category"]) { this.selectedCategory.set(qp["category"]); this.loadProducts(); }
      if (qp["sort"]) this.sortBy.set(qp["sort"]);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loading.set(true);
    const [sort, order] = this.sortBy().split(":");

    const filters: ProductFilters = {
      page: this.currentPage(),
      limit: this.PAGE_SIZE,
      sort,
      order: (order ?? "DESC") as "ASC" | "DESC"
    };

    if (this.selectedCategory()) filters.category = this.selectedCategory();
    if (this.minPrice) filters.minPrice = Number(this.minPrice);
    if (this.maxPrice) filters.maxPrice = Number(this.maxPrice);
    if (this.inStockOnly) filters.inStock = true;
    if (this.searchQuery) filters.search = this.searchQuery;

    this.productApi.getProducts(filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        let prods = res.data ?? [];
        if (this.ratingMin > 0) prods = prods.filter((p: Product) => (p.rating_avg ?? 0) >= this.ratingMin);
        this.products.set(prods);
        this.totalProducts.set(res.total ?? 0);
        this.totalPages.set(res.pages ?? 1);
        this.loading.set(false);
        const cat = this.currentCategory();
        this.seo.updateSeo({
          title: cat ? `${cat.name} — Luv Kush Natural` : "Shop All Products — Luv Kush Natural",
          description: cat?.description || "Premium natural & herbal hair care products. 100% natural ingredients."
        });
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void { this.currentPage.set(1); this.loadProducts(); }

  selectCategory(slug: string): void {
    this.selectedCategory.set(slug);
    this.onFilterChange();
  }

  selectSort(value: string): void {
    this.sortBy.set(value);
    this.sortOpen.set(false);
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategory.set("");
    this.sortBy.set("created_at:DESC");
    this.minPrice = "";
    this.maxPrice = "";
    this.inStockOnly = false;
    this.ratingMin = 0;
    this.searchQuery = "";
    this.currentPage.set(1);
    this.refineOpen.set(false);
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadProducts();
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
