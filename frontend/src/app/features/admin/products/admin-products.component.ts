import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminConfirmService } from '../shared/admin-confirm.service';
import { AdminToastService } from '../shared/admin-toast.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

interface Product {
  id: number; name: string; sku: string; price: number; mrp: number;
  stock_quantity: number; status: string; is_featured: boolean;
  is_bestseller: boolean; is_new: boolean; primary_image: string | null;
  images: string | null; category_name: string; category_id: number;
  subtitle: string | null;
}

interface Category { id: number; name: string; slug: string; }

const EXCLUDED_CATEGORY_SLUGS = ['hair-wigs', 'hair-patches'];

@Component({
  selector: 'lk-admin-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IndianCurrencyPipe],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly confirmSvc = inject(AdminConfirmService);
  private readonly toast = inject(AdminToastService);
  readonly imgUrl = imageUrl;

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  searchQ = '';
  statusFilter = '';
  categoryFilter = '';
  stats = signal<any>(null);
  private searchTimer: any;

  selectedIds = signal<Set<number>>(new Set());
  bulkAction = '';
  showBulkConfirm = signal(false);
  bulkRunning = signal(false);

  readonly allSelected = computed(() => {
    const ids = this.products().map(p => p.id);
    const sel = this.selectedIds();
    return ids.length > 0 && ids.every(id => sel.has(id));
  });

  readonly filteredCategories = computed(() =>
    this.categories().filter(c => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug))
  );

  readonly bulkActionLabel = computed(() => {
    const map: Record<string, string> = { active: 'Activate', draft: 'Deactivate', delete: 'Delete' };
    return map[this.bulkAction] || this.bulkAction;
  });

  discountPct(p: Product): number {
    if (!p.mrp || p.mrp <= p.price) return 0;
    return Math.round(((p.mrp - p.price) / p.mrp) * 100);
  }

  ngOnInit(): void { this.load(); this.loadCategories(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const params: any = { page: this.page(), limit: 20 };
    if (this.searchQ.trim()) params['search'] = this.searchQ.trim();
    if (this.statusFilter) params['status'] = this.statusFilter;
    if (this.categoryFilter) params['category'] = this.categoryFilter;
    this.api.get<any>('/admin/products', params).subscribe({
      next: (res: any) => {
        this.products.set(res.data || []);
        this.total.set(res.total || 0);
        this.pages.set(res.pages || 1);
        this.stats.set(res.stats || null);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.userMessage || 'Failed to load products'); this.loading.set(false); }
    });
  }

  private loadCategories(): void {
    this.api.get<any>('/admin/categories').subscribe({
      next: (res) => this.categories.set(res.data || [])
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
  }

  goPage(n: number): void { this.page.set(n); this.load(); }

  filterStatus(status: string): void { this.statusFilter = status; this.page.set(1); this.load(); }

  onCategoryChange(): void { this.page.set(1); this.load(); }

  toggleSelect(id: number): void {
    this.selectedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  toggleSelectAll(): void {
    this.allSelected()
      ? this.selectedIds.set(new Set())
      : this.selectedIds.set(new Set(this.products().map(p => p.id)));
  }

  clearSelection(): void { this.selectedIds.set(new Set()); this.bulkAction = ''; }

  applyBulk(): void {
    if (!this.bulkAction || this.selectedIds().size === 0) return;
    this.showBulkConfirm.set(true);
  }

  executeBulk(): void {
    this.bulkRunning.set(true);
    const ids = [...this.selectedIds()];
    const reqs: Promise<any>[] = this.bulkAction === 'delete'
      ? ids.map(id => this.api.delete<any>(`/admin/products/${id}`).toPromise().catch(() => null))
      : ids.map(id => this.api.patch<any>(`/admin/products/${id}`, { status: this.bulkAction }).toPromise().catch(() => null));
    Promise.all(reqs).then(() => {
      this.bulkRunning.set(false);
      this.showBulkConfirm.set(false);
      this.toast.success(`${this.bulkActionLabel()} applied to ${ids.length} product(s)`);
      this.clearSelection();
      this.load();
    });
  }

  createProduct(): void { this.router.navigate(['/admin/products/new']); }

  editProduct(id: number): void { this.router.navigate(['/admin/products', id, 'edit']); }

  changeStatus(p: Product): void {
    this.api.patch<any>(`/admin/products/${p.id}`, { status: p.status }).subscribe({
      next: () => this.load(), error: () => this.load()
    });
  }

  toggleFeatured(p: Product): void {
    p.is_featured = !p.is_featured;
    this.api.patch<any>(`/admin/products/${p.id}`, { is_featured: p.is_featured }).subscribe({
      error: () => { p.is_featured = !p.is_featured; this.toast.error('Failed to update featured status'); }
    });
  }

  async confirmDelete(p: Product): Promise<void> {
    const ok = await this.confirmSvc.confirm({
      title: 'Delete Product',
      message: `Permanently delete "${p.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    this.api.delete<any>(`/admin/products/${p.id}`).subscribe({
      next: () => { this.toast.success('Product deleted'); this.load(); },
      error: (err) => this.toast.error(err.userMessage || 'Delete failed')
    });
  }
}
