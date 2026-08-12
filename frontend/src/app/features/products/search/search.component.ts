import {
  Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, PLATFORM_ID
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { RouterLink, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Subject, Observable, of } from "rxjs";
import { switchMap, tap, catchError, takeUntil } from "rxjs/operators";
import { ProductApiService, Product } from "../../../core/services/product-api.service";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { SeoService } from "../../../core/services/seo.service";

@Component({
  selector: "lk-search",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"]
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly productApi = inject(ProductApiService);
  private readonly seo        = inject(SeoService);
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$   = new Subject<void>();

  // Typing alone never searches — only a deliberate action does (Enter,
  // the Search button, a trending/history chip, or a shared ?q= link).
  // That's the only way to guarantee exactly one request per search, no
  // matter how someone paces their typing.
  private readonly search$ = new Subject<string>();

  query     = signal("");
  results   = signal<Product[]>([]);
  loading   = signal(false);
  searched  = signal(false);
  history   = signal<string[]>([]);

  readonly TRENDING = ["Hair Oil", "Bhringraj", "Hair Wig", "Hair Patch", "Amla"];

  ngOnInit(): void {
    this.loadHistory();

    this.search$.pipe(
      switchMap(q => this.runSearch(q)),
      takeUntil(this.destroy$)
    ).subscribe();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(qp => {
      if (qp["q"]) {
        this.query.set(qp["q"]);
        this.search$.next(qp["q"]);
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onInput(q: string): void {
    this.query.set(q);
  }

  onSubmit(): void {
    const q = this.query().trim();
    if (!q) return;
    // Navigating updates the URL's ?q= param, which the queryParams
    // subscription below picks up and turns into the actual search — firing
    // it again here too would double up on every Enter/Search click.
    this.router.navigate([], { queryParams: { q }, replaceUrl: true });
  }

  private runSearch(q: string): Observable<unknown> {
    const trimmed = q.trim();
    if (!trimmed) {
      this.results.set([]);
      this.searched.set(false);
      this.loading.set(false);
      return of(null);
    }

    this.loading.set(true);
    this.searched.set(true);
    this.seo.updateSeo({ title: `"${trimmed}" — Search — Luv Kush Natural` });

    return this.productApi.search(trimmed, 24).pipe(
      tap(res => {
        this.results.set(res.data ?? []);
        this.loading.set(false);
        this.saveHistory(trimmed);
      }),
      catchError(() => {
        this.loading.set(false);
        return of(null);
      })
    );
  }

  searchTrend(term: string): void { this.query.set(term); this.search$.next(term); }
  searchHistory(term: string): void { this.query.set(term); this.search$.next(term); }
  clearHistory(): void { this.history.set([]); if (isPlatformBrowser(this.platformId)) localStorage.removeItem("lk_search_history"); }

  private loadHistory(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem("lk_search_history");
      this.history.set(raw ? JSON.parse(raw) : []);
    } catch { /* ignore */ }
  }

  private saveHistory(q: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const arr = [q, ...this.history().filter(h => h !== q)].slice(0, 6);
      this.history.set(arr);
      localStorage.setItem("lk_search_history", JSON.stringify(arr));
    } catch { /* ignore */ }
  }
}
