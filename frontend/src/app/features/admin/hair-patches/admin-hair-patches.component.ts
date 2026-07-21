import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';

interface HairPatch {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  mrp: number | null;
  size_info: string | null;
  colour_info: string | null;
  how_to_use: string | null;
  primary_image: string | null;
  images: string | null;
  status: string;
  payment_mode?: string;
  advance_amount?: number | null;
}

@Component({
  selector: 'lk-admin-hair-patches',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Hair Patches <span class="count">{{ total() }}</span></h1>
      </div>

      <!-- Status Cards Grid -->
      <div class="status-cards">
        <div class="status-card" [class.card-active]="statusFilter === ''" (click)="filterStatus('')">
          <div class="card-val">{{ stats()?.total ?? 0 }}</div>
          <div class="card-label">Total Patches</div>
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

      <!-- Filters & Actions Bar -->
      <div class="filter-bar">
        <input type="text" class="search-input" placeholder="Search by name..." [(ngModel)]="searchQ" (input)="onSearch()" />
        <select class="filter-select" [(ngModel)]="statusFilter" (change)="load()">
          <option value="">All (Regular)</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button class="btn-primary" (click)="createPatch()">+ Add Patch</button>
      </div>

      @if (selectedIds().size > 0) {
        <div class="bulk-bar">
          <span class="bulk-info">{{ selectedIds().size }} selected</span>
          <select class="bulk-select" [(ngModel)]="bulkAction">
            <option value="">Bulk Action</option>
            <option value="active">Activate Selected</option>
            <option value="inactive">Inactivate Selected</option>
            <option value="draft">Deactivate Selected</option>
            <option value="archived">Archive Selected</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button class="btn-bulk-apply" (click)="applyBulk()" [disabled]="!bulkAction">Apply</button>
          <button class="btn-bulk-clear" (click)="clearSelection()">Clear</button>
        </div>
      }

      @if (loading()) {
        <div class="loading">Loading...</div>
      } @else if (error()) {
        <div class="error-msg">{{ error() }} <button (click)="load()">Retry</button></div>
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              <th class="cb"><input type="checkbox" [checked]="allSelected()" (change)="toggleSelectAll()" /></th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr [class.row-selected]="selectedIds().has(item.id)" [class.row-draft]="item.status === 'draft'">
                <td class="cb"><input type="checkbox" [checked]="selectedIds().has(item.id)" (change)="toggleSelect(item.id)" /></td>
                <td>
                  @if (item.primary_image) {
                    <img [src]="imgUrl(item.primary_image)" class="thumb" [alt]="item.name" />
                  } @else {
                    <div class="thumb-empty">—</div>
                  }
                </td>
                <td>
                  <div class="item-name">{{ item.name }}</div>
                  @if (item.short_description) { <div class="item-sub">{{ item.short_description }}</div> }
                </td>
                <td class="price">₹{{ item.base_price | number:'1.0-0' }}</td>
                <td class="muted">{{ item.size_info || '—' }}</td>
                <td>
                  <select class="inline-select" [(ngModel)]="item.status" (change)="changeStatus(item)">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-edit" (click)="editPatch(item.id)">Edit</button>
                    <button class="btn-delete" (click)="confirmDelete(item)">Delete</button>
                  </div>
                </td>
              </tr>
            }
            @if (!items().length) {
              <tr><td colspan="7" class="empty-cell">No hair patches yet. Click "+ Add Patch" to create one.</td></tr>
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

    @if (showBulkConfirm()) {
      <div class="modal-backdrop" (click)="showBulkConfirm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Confirm Bulk Action</h2>
            <button class="modal-close" (click)="showBulkConfirm.set(false)">✕</button>
          </div>
          <div class="modal-body">
            <p>Apply <strong>{{ bulkActionLabel() }}</strong> to <strong>{{ selectedIds().size }}</strong> item(s)?</p>
            @if (bulkAction === 'delete') {
              <p style="color:#DC2626;font-size:0.85rem;">This cannot be undone.</p>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showBulkConfirm.set(false)">Cancel</button>
            <button [class]="bulkAction === 'delete' ? 'btn-danger' : 'btn-primary'" (click)="executeBulk()" [disabled]="bulkRunning()">
              {{ bulkRunning() ? 'Processing...' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1440px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; color: #1C1C1C; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
    .count { font-size: 0.8rem; font-weight: 500; color: #888; background: #F0F0F0; padding: 2px 8px; border-radius: 20px; }
    .loading { color: #888; padding: 2rem; }
    .error-msg { color: #DC2626; padding: 0.75rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; font-size: 0.875rem; }
    .error-msg button { margin-left: 1rem; background: none; border: 1px solid #DC2626; color: #DC2626; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
    
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; }
    .data-table th { text-align: left; padding: 0.65rem 0.875rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; background: #FAFAFA; border-bottom: 1px solid #E8E8E8; }
    .data-table td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; color: #333; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #F7F8FA; }
    .thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #E8E8E8; }
    .thumb-empty { width: 44px; height: 44px; background: #F0F0F0; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #AAA; font-size: 0.75rem; }
    .item-name { font-weight: 600; color: #1C1C1C; }
    .item-sub { font-size: 0.75rem; color: #888; margin-top: 2px; }
    .price { font-weight: 600; color: #B87333; }
    .muted { color: #888; }
    
    .action-btns { display: flex; gap: 0.5rem; }
    .btn-edit { padding: 4px 10px; background: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.3); color: #B87333; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .btn-edit:hover { background: rgba(184,115,51,0.15); }
    .btn-delete { padding: 4px 10px; background: none; border: 1px solid rgba(220,38,38,0.3); color: #DC2626; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .btn-delete:hover { background: rgba(220,38,38,0.06); }
    .btn-primary { padding: 0.5rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 0.5rem 1.25rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.875rem; cursor: pointer; }
    .empty-cell { text-align: center; color: #AAA; padding: 3rem; font-style: italic; }
    
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto; }
    .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 440px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #E8E8E8; }
    .modal-header h2 { font-size: 1rem; font-weight: 700; color: #1C1C1C; margin: 0; }
    .modal-close { background: none; border: none; color: #888; font-size: 1rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
    .modal-body { padding: 1.5rem; }
    .modal-body p { margin: 0 0 0.5rem; font-size: 0.875rem; color: #333; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #E8E8E8; }
    .btn-danger { padding: 0.5rem 1.25rem; background: #DC2626; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    .bulk-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1rem; background: #FFF8F2; border: 1px solid rgba(184,115,51,0.2); border-radius: 8px; margin-bottom: 1rem; }
    .bulk-info { font-size: 0.8rem; font-weight: 600; color: #B87333; }
    .bulk-select { padding: 0.35rem 0.6rem; border: 1px solid #E8E8E8; border-radius: 4px; font-size: 0.8rem; background: #fff; color: #333; }
    .btn-bulk-apply { padding: 0.35rem 0.8rem; background: #B87333; color: #fff; border: none; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .btn-bulk-apply:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-bulk-clear { padding: 0.35rem 0.8rem; background: none; border: 1px solid #E8E8E8; color: #888; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
    .cb { width: 36px; }
    .row-selected td { background: #FFF8F2 !important; }

    /* Status Cards */
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

    /* Row Draft Styling */
    .row-draft td { color: #999 !important; background: #FAFAFA; }
    .row-draft .item-name { color: #888; }
    .row-draft img { opacity: 0.5; filter: grayscale(100%); }

    /* Filter Actions Alignment */
    .filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-input, .filter-select { padding: 0.5rem 0.75rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 6px; color: #333; font-size: 0.875rem; outline: none; transition: border-color 0.15s; }
    .search-input:focus, .filter-select:focus { border-color: #B87333; }
    .search-input { flex: 1; min-width: 200px; }
    .search-input::placeholder { color: #AAAAAA; }
    .inline-select { background: #fff; border: 1px solid #E8E8E8; border-radius: 4px; color: #333; font-size: 0.8rem; padding: 4px 6px; cursor: pointer; outline: none; }
    .inline-select:focus { border-color: #B87333; }
    .pagination { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1.5rem; font-size: 0.875rem; color: #888; }
    .pagination button { padding: 0.4rem 0.75rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: background 0.15s; }
    .pagination button:hover { background: #F7F8FA; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class AdminHairPatchesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly imgUrl = imageUrl;

  items = signal<HairPatch[]>([]);
  loading = signal(true);
  error = signal('');
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  searchQ = '';
  statusFilter = '';
  stats = signal<any>(null);
  private searchTimer: any;

  selectedIds = signal<Set<number>>(new Set());
  bulkAction = '';
  showBulkConfirm = signal(false);
  bulkRunning = signal(false);

  allSelected = computed(() => {
    const list = this.items();
    return list.length > 0 && list.every(i => this.selectedIds().has(i.id));
  });

  bulkActionLabel = computed(() => {
    const map: Record<string, string> = { active: 'Activate', archived: 'Archive', draft: 'Deactivate', inactive: 'Inactivate', delete: 'Delete' };
    return map[this.bulkAction] || this.bulkAction;
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const params: any = { page: this.page(), limit: 20, type: 'patch' };
    if (this.searchQ.trim()) params['search'] = this.searchQ.trim();
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.api.get<any>('/admin/hair-solutions', params).subscribe({
      next: (res: any) => {
        this.items.set(res.data || []);
        this.total.set(res.total || 0);
        this.pages.set(res.pages || 1);
        this.stats.set(res.stats || null);
        this.loading.set(false);
      },
      error: (err: any) => { this.error.set(err.userMessage || 'Failed to load'); this.loading.set(false); }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
  }

  goPage(n: number): void { this.page.set(n); this.load(); }

  filterStatus(status: string): void {
    this.statusFilter = status;
    this.page.set(1);
    this.load();
  }

  changeStatus(item: HairPatch): void {
    this.api.put<any>(`/admin/hair-solutions/${item.id}`, { status: item.status }).subscribe({
      next: () => this.load(),
      error: () => this.load()
    });
  }

  toggleSelect(id: number): void {
    this.selectedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.items().map(i => i.id)));
    }
  }

  clearSelection(): void { this.selectedIds.set(new Set()); this.bulkAction = ''; }

  applyBulk(): void {
    if (!this.bulkAction || this.selectedIds().size === 0) return;
    this.showBulkConfirm.set(true);
  }

  executeBulk(): void {
    this.bulkRunning.set(true);
    const ids = [...this.selectedIds()];
    let reqs: Promise<any>[];
    if (this.bulkAction === 'delete') {
      reqs = ids.map(id => this.api.delete<any>(`/admin/hair-solutions/${id}`).toPromise().catch(() => null));
    } else {
      const status = this.bulkAction;
      reqs = ids.map(id => this.api.put<any>(`/admin/hair-solutions/${id}`, { status }).toPromise().catch(() => null));
    }
    Promise.all(reqs).then(() => {
      this.bulkRunning.set(false);
      this.showBulkConfirm.set(false);
      this.clearSelection();
      this.load();
    });
  }

  createPatch(): void { this.router.navigate(['/admin/hair-patches/new']); }

  editPatch(id: number): void { this.router.navigate(['/admin/hair-patches', id, 'edit']); }

  confirmDelete(item: HairPatch): void {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.api.delete<any>(`/admin/hair-solutions/${item.id}`).subscribe({
      next: () => this.load(),
      error: (err: any) => alert(err.userMessage || 'Delete failed')
    });
  }
}
