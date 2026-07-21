import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Products <span class="count">{{ total() }}</span></h1>
      </div>

      <!-- Status Cards -->
      <div class="status-cards">
        <div class="status-card" [class.card-active]="statusFilter === ''" (click)="filterStatus('')">
          <div class="card-val">{{ stats()?.total ?? 0 }}</div>
          <div class="card-label">Total Products</div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'active'" (click)="filterStatus('active')">
          <div class="card-val color-active">{{ stats()?.active ?? 0 }}</div>
          <div class="card-label">Active</div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'inactive'" (click)="filterStatus('inactive')">
          <div class="card-val color-inactive">{{ stats()?.inactive ?? 0 }}</div>
          <div class="card-label">Inactive</div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'draft'" (click)="filterStatus('draft')">
          <div class="card-val color-draft">{{ stats()?.draft ?? 0 }}</div>
          <div class="card-label">Drafts</div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'archived'" (click)="filterStatus('archived')">
          <div class="card-val color-archived">{{ stats()?.archived ?? 0 }}</div>
          <div class="card-label">Archived</div>
        </div>
      </div>

      <div class="filter-bar">
        <input type="text" class="search-input" placeholder="Search by name or SKU..." [(ngModel)]="searchQ" (input)="onSearch()" />
        <select class="filter-select" [(ngModel)]="statusFilter" (change)="load()">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select class="filter-select" [(ngModel)]="categoryFilter" (change)="onCategoryChange()">
          <option value="">All Categories</option>
          @for (cat of filteredCategories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
        <button class="btn-primary" (click)="createProduct()">+ Add Product</button>
      </div>

      @if (selectedIds().size > 0) {
        <div class="bulk-bar">
          <span class="bulk-count">{{ selectedIds().size }} selected</span>
          <select class="bulk-select" [(ngModel)]="bulkAction">
            <option value="">Bulk Action...</option>
            <option value="active">Activate Selected</option>
            <option value="draft">Deactivate Selected</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button class="btn-bulk-apply" [disabled]="!bulkAction" (click)="applyBulk()">Apply</button>
          <button class="btn-bulk-clear" (click)="clearSelection()">✕ Clear</button>
        </div>
      }

      @if (loading()) {
        <div class="loading">Loading products...</div>
      } @else if (error()) {
        <div class="error-msg">{{ error() }} <button (click)="load()">Retry</button></div>
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:36px"><input type="checkbox" class="cb" [checked]="allSelected()" (change)="toggleSelectAll()" /></th>
              <th>Image</th><th>Name</th><th>Category</th><th>Price</th>
              <th>Stock</th><th>Status</th><th>Featured</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr [class.row-selected]="selectedIds().has(p.id)" [class.row-draft]="p.status === 'draft'">
                <td><input type="checkbox" class="cb" [checked]="selectedIds().has(p.id)" (change)="toggleSelect(p.id)" /></td>
                <td>
                  @if (p.primary_image) {
                    <img [src]="imgUrl(p.primary_image)" class="thumb" [alt]="p.name" />
                  } @else { <div class="thumb-empty"></div> }
                </td>
                <td>
                  <div class="product-name">{{ p.name }}</div>
                  @if (p.subtitle) { <div class="product-sub">{{ p.subtitle }}</div> }
                  <div class="product-sku">{{ p.sku }}</div>
                </td>
                <td class="muted">{{ p.category_name || '—' }}</td>
                <td>
                  <div>₹{{ p.price | number:'1.0-0' }}</div>
                  @if (p.mrp > p.price) { <div class="mrp">₹{{ p.mrp | number:'1.0-0' }}</div> }
                </td>
                <td [class.stock-low]="p.stock_quantity > 0 && p.stock_quantity <= 5"
                    [class.stock-out]="p.stock_quantity === 0">{{ p.stock_quantity }}</td>
                <td>
                  <select class="inline-select" [(ngModel)]="p.status" (change)="changeStatus(p)">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td><input type="checkbox" [checked]="p.is_featured" (change)="toggleFeatured(p)" class="cb" /></td>
                <td>
                  <div class="action-btns">
                    <button class="btn-edit" (click)="editProduct(p.id)">Edit</button>
                    <button class="btn-delete" (click)="confirmDelete(p)">Delete</button>
                  </div>
                </td>
              </tr>
            }
            @if (!products().length) {
              <tr><td colspan="9" class="empty-cell">No products found</td></tr>
            }
          </tbody>
        </table>

        @if (pages() > 1) {
          <div class="pagination">
            <button [disabled]="page() === 1" (click)="goPage(page() - 1)">← Prev</button>
            <span>Page {{ page() }} of {{ pages() }}</span>
            <button [disabled]="page() === pages()" (click)="goPage(page() + 1)">Next →</button>
          </div>
        }
      }
    </div>

    <!-- Bulk Confirm Modal -->
    @if (showBulkConfirm()) {
      <div class="modal-backdrop" (click)="showBulkConfirm.set(false)">
        <div class="modal confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Confirm Bulk Action</h2>
            <button class="modal-close" (click)="showBulkConfirm.set(false)">✕</button>
          </div>
          <div class="modal-body">
            <p>Apply <strong>{{ bulkActionLabel() }}</strong> to <strong>{{ selectedIds().size }}</strong> products?
              @if (bulkAction === 'delete') {
                <br/><span style="color:#DC2626;font-size:0.8rem">This permanently deletes the products and their images.</span>
              }
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showBulkConfirm.set(false)">Cancel</button>
            <button class="btn-primary" [class.btn-danger]="bulkAction === 'delete'" (click)="executeBulk()" [disabled]="bulkRunning()">
              {{ bulkRunning() ? 'Applying...' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 2rem; max-width: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; color: #1C1C1C; margin: 0; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.01em; }
    .count { font-size: 0.8rem; font-weight: 500; color: #888; background: #F0F0F0; padding: 2px 8px; border-radius: 20px; }
    .filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-input, .filter-select { padding: 0.5rem 0.75rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 6px; color: #333; font-size: 0.875rem; outline: none; }
    .search-input:focus, .filter-select:focus { border-color: #B87333; }
    .search-input { flex: 1; min-width: 200px; }
    .search-input::placeholder { color: #AAAAAA; }
    .bulk-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1rem; background: rgba(184,115,51,0.06); border: 1px solid rgba(184,115,51,0.2); border-radius: 6px; margin-bottom: 1rem; }
    .bulk-count { font-size: 0.8rem; font-weight: 600; color: #B87333; }
    .bulk-select { padding: 0.4rem 0.6rem; border: 1px solid #E8E8E8; border-radius: 4px; font-size: 0.8rem; outline: none; background: #fff; }
    .btn-bulk-apply { padding: 0.35rem 0.75rem; background: #B87333; color: #fff; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
    .btn-bulk-apply:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-bulk-clear { padding: 0.35rem 0.75rem; background: none; border: 1px solid #E8E8E8; color: #888; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
    .loading { color: #888; padding: 2rem; }
    .error-msg { color: #DC2626; padding: 0.75rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; font-size: 0.875rem; }
    .error-msg button { margin-left: 1rem; background: none; border: 1px solid #DC2626; color: #DC2626; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; }
    .data-table th { text-align: left; padding: 0.65rem 0.875rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; background: #FAFAFA; border-bottom: 1px solid #E8E8E8; }
    .data-table td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; color: #333; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #F7F8FA; }
    .row-selected td { background: rgba(184,115,51,0.05) !important; }
    .cb { width: 15px; height: 15px; cursor: pointer; accent-color: #B87333; }
    .thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #E8E8E8; }
    .thumb-empty { width: 44px; height: 44px; background: #F0F0F0; border-radius: 6px; }
    .product-name { font-weight: 600; color: #1C1C1C; }
    .product-sub { font-size: 0.72rem; color: #888; margin-top: 1px; }
    .product-sku { font-size: 0.68rem; color: #AAAAAA; margin-top: 2px; font-family: monospace; }
    .mrp { font-size: 0.75rem; color: #AAAAAA; text-decoration: line-through; }
    .muted { color: #888; }
    .stock-low { color: #B45309; font-weight: 600; }
    .stock-out { color: #DC2626; font-weight: 600; }
    .inline-select { background: #fff; border: 1px solid #E8E8E8; border-radius: 4px; color: #333; font-size: 0.8rem; padding: 4px 6px; cursor: pointer; outline: none; }
    .action-btns { display: flex; gap: 0.5rem; }
    .btn-edit { padding: 4px 10px; background: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.3); color: #B87333; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .btn-edit:hover { background: rgba(184,115,51,0.15); }
    .btn-delete { padding: 4px 10px; background: none; border: 1px solid rgba(220,38,38,0.3); color: #DC2626; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .btn-delete:hover { background: rgba(220,38,38,0.06); }
    .btn-primary { padding: 0.5rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-danger { background: #DC2626 !important; }
    .btn-secondary { padding: 0.5rem 1.25rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.875rem; cursor: pointer; }
    .empty-cell { text-align: center; color: #AAAAAA; padding: 3rem; font-style: italic; }
    .pagination { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1.5rem; font-size: 0.875rem; color: #888; }
    .pagination button { padding: 0.4rem 0.75rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal { background: #fff; border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); width: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .confirm-modal { max-width: 440px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #E8E8E8; flex-shrink: 0; }
    .modal-header h2 { font-size: 1rem; font-weight: 700; color: #1C1C1C; margin: 0; }
    .modal-close { background: none; border: none; color: #888; font-size: 1.1rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
    .modal-body { padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; min-height: 0; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 0.9rem 1.5rem; border-top: 1px solid #E8E8E8; flex-shrink: 0; }
    .status-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .status-card { background: #fff; border: 1px solid #E8E8E8; border-radius: 10px; padding: 1.25rem; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 0.25rem; }
    .status-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .card-active { border-color: #B87333; background: #FAF7F2; }
    .card-val { font-size: 1.5rem; font-weight: 700; color: #1C1C1C; }
    .card-label { font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .color-active { color: #3D5A47; }
    .color-inactive { color: #D97706; }
    .color-draft { color: #6B7280; }
    .color-archived { color: #4B5563; }
    .row-draft td { color: #999 !important; background: #FAFAFA; }
    .row-draft .product-name { color: #888; }
    .row-draft img { opacity: 0.5; filter: grayscale(100%); }
  `]
})
export class AdminProductsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
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
      error: () => { p.is_featured = !p.is_featured; }
    });
  }

  confirmDelete(p: Product): void {
    if (!confirm(`Permanently delete "${p.name}"? This cannot be undone.`)) return;
    this.api.delete<any>(`/admin/products/${p.id}`).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.userMessage || 'Delete failed')
    });
  }
}
