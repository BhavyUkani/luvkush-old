import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminConfirmService } from '../shared/admin-confirm.service';
import { AdminToastService } from '../shared/admin-toast.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

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
  imports: [CommonModule, FormsModule, IndianCurrencyPipe],
  templateUrl: './admin-hair-patches.component.html',
  styleUrls: ['./admin-hair-patches.component.scss'],
})
export class AdminHairPatchesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly confirmSvc = inject(AdminConfirmService);
  private readonly toast = inject(AdminToastService);
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
      this.toast.success(`${this.bulkActionLabel()} applied to ${ids.length} item(s)`);
      this.clearSelection();
      this.load();
    });
  }

  createPatch(): void { this.router.navigate(['/admin/hair-patches/new']); }

  editPatch(id: number): void { this.router.navigate(['/admin/hair-patches', id, 'edit']); }

  async confirmDelete(item: HairPatch): Promise<void> {
    const ok = await this.confirmSvc.confirm({
      title: 'Delete Hair Patch',
      message: `Delete "${item.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    this.api.delete<any>(`/admin/hair-solutions/${item.id}`).subscribe({
      next: () => { this.toast.success('Hair patch deleted'); this.load(); },
      error: (err: any) => this.toast.error(err.userMessage || 'Delete failed')
    });
  }
}
