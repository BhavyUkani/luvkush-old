import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

// Mirrors AdminService#getDashboardStats()'s return shape
// (backend/src/modules/admin/admin.service.ts). SUM()/COUNT() results come
// back from mysql2 as numeric strings at the JSON layer, but every consumer
// here (the `inr`/`number` pipes, arithmetic comparisons) already coerces
// them the same way a plain `number` would behave, so that's how they're
// typed — matches how they're actually used, not a behavioural change.
interface PeriodCount { total: number; today: number; this_week: number; }
interface PeriodRevenue extends PeriodCount { this_month: number; }
interface RecentOrder {
  id: number; order_number: string; status: string; total_amount: number;
  created_at: string; first_name: string; last_name: string;
}
interface TopProduct {
  id: number; name: string; slug: string; primary_image: string | null;
  price: number; sales_count: number; stock_quantity: number;
}
interface RevenueChartPoint { date: string; revenue: number; orders: number; }

interface DashboardStats {
  orders: PeriodCount & { pending: number; processing: number; shipped: number; delivered: number; };
  revenue: PeriodRevenue;
  customers: PeriodCount;
  products: { total: number; active: number; out_of_stock: number; low_stock: number; };
  profit: { total: number; today: number; this_month: number; excluded_items: number; };
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  revenueChart: RevenueChartPoint[];
}

@Component({
  selector: 'lk-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, IndianCurrencyPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal('');
  readonly today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  ngOnInit(): void {
    this.api.get<DashboardStats>('/admin/dashboard').subscribe({
      next: (res) => { this.stats.set(res.data ?? null); this.loading.set(false); },
      error: (err) => { this.error.set(err.userMessage || 'Failed to load dashboard'); this.loading.set(false); }
    });
  }
}
