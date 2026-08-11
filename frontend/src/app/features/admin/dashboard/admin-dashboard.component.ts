import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

@Component({
  selector: 'lk-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, IndianCurrencyPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <span class="date">{{ today }}</span>
      </div>

      @if (loading()) {
        <div class="stats-grid stats-grid--primary">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card stat-skel">
              <div class="skel-line skel-icon"></div>
              <div class="skel-line skel-label"></div>
              <div class="skel-line skel-value"></div>
              <div class="skel-line skel-sub"></div>
            </div>
          }
        </div>
        <div class="stats-grid stats-grid--secondary">
          @for (i of [1,2,3]; track i) {
            <div class="stat-card stat-skel stat-card--sm">
              <div class="skel-line skel-label"></div>
              <div class="skel-line skel-value"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="error-msg">{{ error() }}</div>
      } @else {
        <!-- Primary metrics -->
        <div class="stats-grid stats-grid--primary">
          <div class="stat-card stat-info">
            <div class="stat-icon stat-icon--info">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1.5" y="5.5" width="17" height="9" rx="1.6" stroke="currentColor" stroke-width="1.3"/><circle cx="10" cy="10" r="2.1" stroke="currentColor" stroke-width="1.2"/><circle cx="4.3" cy="10" r="0.5" fill="currentColor"/><circle cx="15.7" cy="10" r="0.5" fill="currentColor"/></svg>
            </div>
            <div class="stat-label">Total Sales</div>
            <div class="stat-value">{{ stats()?.revenue?.total ?? 0 | inr }}</div>
            <div class="stat-sub">All-time paid sales</div>
          </div>
          <div class="stat-card stat-success">
            <div class="stat-icon stat-icon--success">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.5 13.5L7.5 8.5L10.8 11.8L17.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.8 5H17.5V9.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="stat-label">Total Profit</div>
            <div class="stat-value">{{ stats()?.profit?.total ?? 0 | inr }}</div>
            <div class="stat-sub">{{ stats()?.profit?.this_month ?? 0 | inr }} this month</div>
          </div>
          <div class="stat-card stat-purple">
            <div class="stat-icon stat-icon--purple">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4.5 7H15.5L14.7 16.5C14.65 17.05 14.2 17.5 13.6 17.5H6.4C5.8 17.5 5.35 17.05 5.3 16.5L4.5 7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M7.3 7V5.3C7.3 3.5 8.5 2 10 2C11.5 2 12.7 3.5 12.7 5.3V7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            </div>
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">{{ stats()?.orders?.total ?? 0 }}</div>
            <div class="stat-sub">{{ stats()?.orders?.today ?? 0 }} today</div>
          </div>
          <div class="stat-card stat-teal">
            <div class="stat-icon stat-icon--teal">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7.3" cy="6.8" r="2.8" stroke="currentColor" stroke-width="1.25"/><circle cx="14" cy="7.3" r="2.2" stroke="currentColor" stroke-width="1.15"/><path d="M2.2 17C2.2 13.7 4.4 11.6 7.3 11.6C9.4 11.6 11.2 12.7 12.1 14.4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M11.8 17C12 14 13.9 12.1 16.2 12.1C17.4 12.1 18.4 12.6 19.1 13.4" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/></svg>
            </div>
            <div class="stat-label">Total Customers</div>
            <div class="stat-value">{{ stats()?.customers?.total ?? 0 }}</div>
            <div class="stat-sub">{{ stats()?.customers?.today ?? 0 }} joined today</div>
          </div>
        </div>

        <!-- Secondary / attention metrics -->
        <div class="stats-grid stats-grid--secondary">
          <div class="stat-card stat-card--sm stat-info">
            <div class="stat-card--sm-row">
              <div>
                <div class="stat-label">Revenue This Month</div>
                <div class="stat-value stat-value--sm">{{ stats()?.revenue?.this_month ?? 0 | inr }}</div>
              </div>
              <div class="stat-icon stat-icon--info">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 6.5H14.5" stroke="currentColor" stroke-width="1.2"/><path d="M5 1.5V4M11 1.5V4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              </div>
            </div>
            <div class="stat-sub">{{ stats()?.revenue?.today ?? 0 | inr }} today</div>
          </div>
          <div class="stat-card stat-card--sm stat-warn">
            <div class="stat-card--sm-row">
              <div>
                <div class="stat-label">Pending Orders</div>
                <div class="stat-value stat-value--sm">{{ stats()?.orders?.pending ?? 0 }}</div>
              </div>
              <div class="stat-icon stat-icon--warn">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.3" stroke="currentColor" stroke-width="1.2"/><path d="M8 4.5V8L10.3 9.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
            <div class="stat-sub">Needs action</div>
          </div>
          <div class="stat-card stat-card--sm stat-alert">
            <div class="stat-card--sm-row">
              <div>
                <div class="stat-label">Out of Stock</div>
                <div class="stat-value stat-value--sm">{{ stats()?.products?.out_of_stock ?? 0 }}</div>
              </div>
              <div class="stat-icon stat-icon--alert">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 6.5V9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="11.2" r="0.9" fill="currentColor"/></svg>
              </div>
            </div>
            <div class="stat-sub">{{ stats()?.products?.low_stock ?? 0 }} low stock</div>
          </div>
        </div>

        <div class="section-row">
          <h2>Recent Orders</h2>
          <a routerLink="/admin/orders" class="view-all">View All →</a>
        </div>

        @if (!stats()?.recentOrders?.length) {
          <div class="empty-state">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M6 10H30M9 10L10.5 30H25.5L27 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 15V23M22 15V23" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <p>No orders yet</p>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th class="ta-right">Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (order of stats()?.recentOrders ?? []; track order.id) {
                <tr>
                  <td><strong>{{ order.order_number }}</strong></td>
                  <td>
                    <div class="cust-cell">
                      <span class="cust-avatar">{{ order.first_name?.charAt(0) }}</span>
                      <span>{{ order.first_name }} {{ order.last_name }}</span>
                    </div>
                  </td>
                  <td class="ta-right amount-cell">{{ order.total_amount | inr }}</td>
                  <td><span class="badge badge-{{ order.status }}">{{ order.status }}</span></td>
                  <td class="muted">{{ order.created_at | date:'dd MMM, HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 100%; box-sizing: border-box; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; margin: 0; color: #1C1C1C; letter-spacing: -0.01em; }
    .date { font-size: 0.8rem; color: #888; }
    .error-msg { color: #DC2626; padding: 0.875rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }

    .stats-grid--primary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .stats-grid--secondary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    @media(max-width:1100px) { .stats-grid--primary { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width:900px) { .stats-grid--secondary { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width:600px) { .stats-grid--primary, .stats-grid--secondary { grid-template-columns: 1fr; } }

    .stat-card { background: #F3EFE8; border: 1px solid #E0D8C8; border-radius: 10px; padding: 1.25rem 1.375rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: box-shadow 0.18s ease, transform 0.18s ease; }
    .stat-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); transform: translateY(-1px); }
    .stat-card.stat-success { border-color: rgba(21,128,61,0.35); background: linear-gradient(rgba(21,128,61,0.08), rgba(21,128,61,0.08)), #F3EFE8; }
    .stat-card.stat-warn { border-color: rgba(180,83,9,0.38); background: linear-gradient(rgba(180,83,9,0.1), rgba(180,83,9,0.1)), #F3EFE8; }
    .stat-card.stat-alert { border-color: rgba(220,38,38,0.32); background: linear-gradient(rgba(220,38,38,0.09), rgba(220,38,38,0.09)), #F3EFE8; }
    .stat-card.stat-info { border-color: rgba(29,78,216,0.32); background: linear-gradient(rgba(29,78,216,0.07), rgba(29,78,216,0.07)), #F3EFE8; }
    .stat-card.stat-purple { border-color: rgba(124,58,237,0.32); background: linear-gradient(rgba(124,58,237,0.08), rgba(124,58,237,0.08)), #F3EFE8; }
    .stat-card.stat-teal { border-color: rgba(13,148,136,0.32); background: linear-gradient(rgba(13,148,136,0.08), rgba(13,148,136,0.08)), #F3EFE8; }

    .stat-icon { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 9px; background: rgba(184,115,51,0.1); color: #B87333; margin-bottom: 0.85rem; flex-shrink: 0; }
    .stat-icon--muted { background: rgba(0,0,0,0.06); color: #888; }
    .stat-icon--success { background: rgba(21,128,61,0.1); color: #15803D; }
    .stat-icon--warn { background: rgba(180,83,9,0.14); color: #B45309; }
    .stat-icon--alert { background: rgba(220,38,38,0.12); color: #DC2626; }
    .stat-icon--info { background: rgba(29,78,216,0.1); color: #1D4ED8; }
    .stat-icon--purple { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .stat-icon--teal { background: rgba(13,148,136,0.1); color: #0D9488; }

    .stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; margin-bottom: 0.4rem; }
    .stat-value { font-size: 1.85rem; font-weight: 300; color: #1C1C1C; line-height: 1; margin-bottom: 0.3rem; letter-spacing: -0.02em; }
    .stat-value--sm { font-size: 1.4rem; margin-bottom: 0; }
    .stat-sub { font-size: 0.75rem; color: #888; }

    .stat-card--sm { padding: 1rem 1.25rem; }
    .stat-card--sm-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.35rem; }
    .stat-card--sm .stat-icon { margin-bottom: 0; flex-shrink: 0; width: 34px; height: 34px; border-radius: 8px; }

    .stat-skel { cursor: default; }
    .stat-skel:hover { box-shadow: 0 1px 3px rgba(0,0,0,0.05); transform: none; }
    .skel-line { background: linear-gradient(90deg, #E6DFD3 25%, #EDE7DC 37%, #E6DFD3 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; border-radius: 4px; }
    .skel-icon { width: 34px; height: 34px; border-radius: 8px; margin-bottom: 0.85rem; }
    .skel-label { width: 55%; height: 9px; margin-bottom: 0.75rem; }
    .skel-value { width: 70%; height: 24px; margin-bottom: 0.5rem; }
    .skel-sub { width: 40%; height: 8px; }
    @keyframes skel-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

    .section-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.875rem; }
    .section-row h2 { font-size: 0.95rem; font-weight: 600; color: #1C1C1C; margin: 0; }
    .view-all { font-size: 0.8rem; color: #B87333; text-decoration: none; font-weight: 500; }
    .view-all:hover { text-decoration: underline; }

    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; }
    .data-table th { text-align: left; padding: 0.65rem 1rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; background: #FAFAFA; border-bottom: 1px solid #E8E8E8; }
    .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #F0F0F0; color: #333; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #F7F8FA; }
    .ta-right { text-align: right; }
    .amount-cell { font-weight: 600; color: #1C1C1C; }
    .muted { color: #888; }

    .cust-cell { display: flex; align-items: center; gap: 0.6rem; }
    .cust-avatar { width: 26px; height: 26px; border-radius: 50%; background: rgba(184,115,51,0.12); color: #B87333; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-transform: uppercase; }

    .badge { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; background: #F0F0F0; color: #888; }
    .badge-pending { background: rgba(180,83,9,0.1); color: #B45309; }
    .badge-confirmed, .badge-processing { background: rgba(29,78,216,0.09); color: #1D4ED8; }
    .badge-shipped, .badge-out_for_delivery { background: rgba(124,58,237,0.09); color: #7C3AED; }
    .badge-delivered { background: rgba(21,128,61,0.09); color: #15803D; }
    .badge-cancelled, .badge-refunded { background: rgba(220,38,38,0.09); color: #DC2626; }

    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; padding: 3rem 1rem; color: #AAAAAA; background: #fff; border: 1px dashed #E2E8F0; border-radius: 8px; }
    .empty-state p { margin: 0; font-size: 0.85rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  stats = signal<any>(null);
  loading = signal(true);
  error = signal('');
  readonly today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  ngOnInit(): void {
    this.api.get<any>('/admin/dashboard').subscribe({
      next: (res) => { this.stats.set(res.data); this.loading.set(false); },
      error: (err) => { this.error.set(err.userMessage || 'Failed to load dashboard'); this.loading.set(false); }
    });
  }
}
