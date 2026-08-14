import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminToastService } from '../shared/admin-toast.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  item_count?: number;
  advance_paid_amount?: number | null;
}



const ALL_STATUSES = [
  'pending','confirmed','processing','quality_check','shipped',
  'out_for_delivery','delivered','cancelled','refund_requested','refunded','returned'
];

@Component({
  selector: 'lk-admin-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, IndianCurrencyPipe],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss'],
})
export class AdminOrdersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(AdminToastService);
  readonly imgUrl = imageUrl;

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal('');
  total = signal(0);
  statusCounts = signal<Record<string, number>>({});
  page = signal(1);
  pages = signal(1);
  searchQ = '';
  statusFilter = '';
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  // Bulk actions
  selectedIds = signal<Set<number>>(new Set());
  bulkAction = '';
  showBulkConfirm = signal(false);
  bulkRunning = signal(false);

  readonly statuses = ALL_STATUSES;

  readonly allOrdersCount = computed(() =>
    Object.values(this.statusCounts()).reduce((a, b) => a + b, 0)
  );

  readonly allSelected = computed(() => {
    const ids = this.orders().map(o => o.id);
    const sel = this.selectedIds();
    return ids.length > 0 && ids.every(id => sel.has(id));
  });



  readonly bulkActionLabel = computed(() => {
    if (!this.bulkAction) return '';
    return 'Mark ' + this.formatStatus(this.bulkAction);
  });

  ngOnInit(): void { this.load(); this.loadStatusCounts(); }

  loadStatusCounts(): void {
    this.api.get<Record<string, number>>('/orders/status-counts').subscribe({
      next: (res) => this.statusCounts.set(res.data || {}),
      error: () => {}
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const params: Record<string, string | number> = { page: this.page(), limit: 20 };
    if (this.searchQ.trim()) params['search'] = this.searchQ.trim();
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.api.get<Order[]>('/orders', params).subscribe({
      next: (res) => {
        this.orders.set(res.data || []);
        this.total.set(res.total || 0);
        this.pages.set(res.pages || 1);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.userMessage || 'Failed to load orders'); this.loading.set(false); }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
  }

  goPage(n: number): void { this.page.set(n); this.load(); }

  formatStatus(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatPaymentMethod(m: string): string {
    const map: Record<string, string> = {
      cod: 'Cash on Delivery', razorpay: 'Online (Razorpay)',
      partial: 'Partial (Advance)', hybrid: 'Customer Choice'
    };
    return map[m] || m;
  }

  changeStatus(o: Order): void {
    this.api.patch<unknown>(`/orders/${o.id}/status`, { status: o.status }).subscribe({
      next: () => this.loadStatusCounts(),
      error: (err) => { this.toast.error(err.userMessage || 'Failed to update status'); this.load(); }
    });
  }

  // Bulk actions
  toggleSelect(id: number): void {
    this.selectedIds.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.orders().map(o => o.id)));
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
    const newStatus = this.bulkAction;
    if (!newStatus) { this.bulkRunning.set(false); return; }

    const reqs = ids.map(id => this.api.patch<unknown>(`/orders/${id}/status`, { status: newStatus }).toPromise().catch(() => null));
    Promise.all(reqs).then(() => {
      this.bulkRunning.set(false);
      this.showBulkConfirm.set(false);
      this.toast.success(`${ids.length} order(s) marked ${this.formatStatus(newStatus)}`);
      this.clearSelection();
      this.load();
      this.loadStatusCounts();
    });
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.page.set(1);
    this.load();
  }

}
