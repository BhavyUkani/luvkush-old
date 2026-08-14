import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminToastService } from '../shared/admin-toast.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  order_count?: number;
  total_spent?: number;
  created_at: string;
}

@Component({
  selector: 'lk-admin-customers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IndianCurrencyPipe],
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.scss'],
})
export class AdminCustomersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(AdminToastService);

  customers = signal<Customer[]>([]);
  loading = signal(true);
  error = signal('');
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  searchQ = '';
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  selectedIds = signal<Set<number>>(new Set());
  bulkAction = '';
  showBulkConfirm = signal(false);
  bulkRunning = signal(false);

  allSelected = computed(() => {
    const list = this.customers();
    return list.length > 0 && list.every(c => this.selectedIds().has(c.id));
  });

  bulkActionLabel = computed(() => {
    if (this.bulkAction === 'delete') return 'Delete';
    if (this.bulkAction === 'active') return 'Activate';
    if (this.bulkAction === 'suspended') return 'Deactivate';
    return 'Apply action to';
  });

  toggleSelect(id: number): void {
    this.selectedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.customers().map(c => c.id)));
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
    let reqs: Promise<unknown>[];
    if (this.bulkAction === 'delete') {
      reqs = ids.map(id => this.api.delete<unknown>(`/admin/customers/${id}`).toPromise().catch(() => null));
    } else {
      const status = this.bulkAction;
      reqs = ids.map(id => this.api.put<unknown>(`/admin/customers/${id}`, { status }).toPromise().catch(() => null));
    }
    Promise.all(reqs).then(() => {
      this.bulkRunning.set(false);
      this.showBulkConfirm.set(false);
      this.toast.success(`${this.bulkActionLabel()} applied to ${ids.length} customer(s)`);
      this.clearSelection();
      this.load();
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const params: Record<string, string | number> = { page: this.page(), limit: 20 };
    if (this.searchQ.trim()) params['search'] = this.searchQ.trim();

    this.api.get<Customer[]>('/admin/customers', params).subscribe({
      next: (res) => {
        this.customers.set(res.data || []);
        this.total.set(res.total || 0);
        this.pages.set(res.pages || 1);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.userMessage || 'Failed to load customers'); this.loading.set(false); }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
  }

  goPage(n: number): void { this.page.set(n); this.load(); }
}
