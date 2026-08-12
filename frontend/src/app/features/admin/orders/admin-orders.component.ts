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
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Orders <span class="count">{{ total() }}</span></h1>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.4"/><path d="M11 11L14.5 14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input type="text" class="search-input" placeholder="Search by order # or customer..." [(ngModel)]="searchQ" (input)="onSearch()" />
        </div>
      </div>

      <!-- Status Filter Pills -->
      <div class="status-tabs">
        <button class="status-tab" [class.active]="statusFilter === ''" (click)="setStatusFilter('')">
          All Orders <span class="tab-count">{{ allOrdersCount() }}</span>
        </button>
        @for (s of statuses; track s) {
          <button class="status-tab" [class.active]="statusFilter === s" (click)="setStatusFilter(s)">
            {{ formatStatus(s) }} <span class="tab-count">{{ statusCounts()[s] ?? 0 }}</span>
          </button>
        }
      </div>

      <!-- Bulk Actions Bar -->
      @if (selectedIds().size > 0) {
        <div class="bulk-bar">
          <div class="bulk-count">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ selectedIds().size }} selected
          </div>
          <div class="select-wrap select-wrap--bulk">
            <select class="bulk-select" [(ngModel)]="bulkAction">
              <option value="">Update Status...</option>
              @for (s of statuses; track s) {
                <option [value]="s">Mark {{ formatStatus(s) }}</option>
              }
            </select>
            <svg class="select-caret" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <button class="btn-bulk-apply" [disabled]="!bulkAction" (click)="applyBulk()">Apply</button>
          <button class="btn-bulk-clear" (click)="clearSelection()">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Clear
          </button>
        </div>
      }

      @if (loading()) {
        <table class="data-table">
          <tbody>
            @for (i of [1,2,3,4,5]; track i) {
              <tr class="skel-row">
                <td style="width:36px"></td>
                <td><div class="skel-line" style="width:65%"></div></td>
                <td><div class="skel-line" style="width:60%;margin-bottom:6px"></div><div class="skel-line" style="width:75%;height:8px"></div></td>
                <td><div class="skel-line" style="width:45%"></div></td>
                <td><div class="skel-line" style="width:55%"></div></td>
                <td><div class="skel-line" style="width:60%"></div></td>
                <td><div class="skel-line" style="width:50%"></div></td>
                <td><div class="skel-line" style="width:40%"></div></td>
              </tr>
            }
          </tbody>
        </table>
      } @else if (error()) {
        <div class="error-msg">{{ error() }} <button (click)="load()">Retry</button></div>
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:36px">
                <input type="checkbox" class="cb" [checked]="allSelected()" (change)="toggleSelectAll()" />
              </th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (o of orders(); track o.id) {
              <tr [class.row-selected]="selectedIds().has(o.id)">
                <td>
                  <input type="checkbox" class="cb" [checked]="selectedIds().has(o.id)" (change)="toggleSelect(o.id)" />
                </td>
                <td><strong>{{ o.order_number }}</strong></td>
                <td>
                  <div class="cust-name">{{ o.first_name }} {{ o.last_name }}</div>
                  <div class="cust-email">{{ o.email }}</div>
                </td>
                <td class="amount">₹{{ o.total_amount ?? 0 | inr:false }}</td>
                <td>
                  <span class="badge" [class]="'pay-' + o.payment_status"><span class="badge-dot"></span>{{ o.payment_status }}</span>
                  <div class="muted-sm">{{ o.advance_paid_amount ? 'Partial (Advance)' : formatPaymentMethod(o.payment_method) }}</div>
                </td>
                <td>
                  <div class="select-wrap select-wrap--status" [class]="'status-' + o.status">
                    <select class="inline-select" [(ngModel)]="o.status" (change)="changeStatus(o)">
                      @for (s of statuses; track s) {
                        <option [value]="s">{{ formatStatus(s) }}</option>
                      }
                    </select>
                    <svg class="select-caret" width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </td>
                <td class="muted">{{ o.created_at | date:'dd MMM, HH:mm' }}</td>
                <td>
                  <div class="action-btns">
                    <a [routerLink]="['/admin/orders', o.id]" class="btn-view">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 8C1 8 4 3 8 3C12 3 15 8 15 8C15 8 12 13 8 13C4 13 1 8 1 8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.3"/></svg>
                      View
                    </a>
                  </div>
                </td>
              </tr>
            }
            @if (!orders().length) {
              <tr><td colspan="8" class="empty-cell">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 10H26M9 10L10.5 28H21.5L23 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 15V22M19 15V22" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                <div>No orders found</div>
              </td></tr>
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



    <!-- Bulk confirm modal -->
    @if (showBulkConfirm()) {
      <div class="modal-backdrop" (click)="showBulkConfirm.set(false)">
        <div class="modal confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Confirm Bulk Action</h2>
            <button class="modal-close" (click)="showBulkConfirm.set(false)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p>Apply <strong>{{ bulkActionLabel() }}</strong> to <strong>{{ selectedIds().size }}</strong> orders?</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showBulkConfirm.set(false)">Cancel</button>
            <button class="btn-primary" (click)="executeBulk()" [disabled]="bulkRunning()">
              {{ bulkRunning() ? 'Applying...' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 2rem 0; max-width: 100%; width: 100%; box-sizing: border-box; }
    .status-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; padding: 0 2rem; }
    .status-tab { padding: 0.45rem 1rem; background: #fff; border: 1px solid #E0D8C8; border-radius: 20px; color: #666; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; white-space: nowrap; }
    .status-tab:hover { background: #FAF8F5; color: #1C1C1C; border-color: #D0C4AE; }
    .status-tab.active { background: #B87333; color: #fff; border-color: #B87333; box-shadow: 0 2px 8px rgba(184, 115, 51, 0.25); }
    .tab-count { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 5px; margin-left: 5px; border-radius: 9px; background: rgba(0,0,0,0.06); color: inherit; font-size: 0.66rem; font-weight: 800; }
    .status-tab.active .tab-count { background: rgba(255,255,255,0.25); }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 2rem; }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; color: #1C1C1C; margin: 0; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.01em; }
    .count { font-size: 0.8rem; font-weight: 500; color: #888; background: #F0F0F0; padding: 2px 8px; border-radius: 20px; }
    .filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; padding: 0 2rem; }
    .search-wrap { position: relative; flex: 1; min-width: 220px; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 0.75rem; color: #AAAAAA; pointer-events: none; }
    .search-input { width: 100%; padding: 0.55rem 0.75rem 0.55rem 2.15rem; background: #fff; border: 1px solid #E0D8C8; border-radius: 8px; color: #333; font-size: 0.875rem; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; }
    .search-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .search-input::placeholder { color: #AAAAAA; }

    /* Bulk bar */
    .bulk-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; background: linear-gradient(rgba(184,115,51,0.08), rgba(184,115,51,0.08)), #F3EFE8; border: 1px solid rgba(184,115,51,0.3); border-radius: 8px; margin: 0 2rem 1rem 2rem; }
    .bulk-count { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700; color: #B87333; }
    .select-wrap--bulk { position: relative; display: flex; align-items: center; }
    .select-wrap--bulk .bulk-select { padding: 0.4rem 1.7rem 0.4rem 0.65rem; border: 1px solid #E0D8C8; border-radius: 6px; font-size: 0.8rem; outline: none; background: #fff; appearance: none; cursor: pointer; }
    .select-wrap--bulk .select-caret { position: absolute; right: 0.6rem; color: #999; pointer-events: none; }
    .btn-bulk-apply { padding: 0.4rem 0.9rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-bulk-apply:hover { opacity: 0.9; }
    .btn-bulk-apply:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-bulk-clear { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem; background: none; border: 1px solid #E0D8C8; color: #888; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: background 0.15s; }
    .btn-bulk-clear:hover { background: rgba(0,0,0,0.03); }

    .error-msg { color: #DC2626; padding: 0.75rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; margin: 0 2rem 1rem 2rem; font-size: 0.875rem; }
    .skel-row td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; }
    .skel-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg, #F0F0F0 25%, #F7F7F7 37%, #F0F0F0 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
    @keyframes skel-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
    .success-msg { color: #15803D; padding: 0.75rem; background: rgba(21,128,61,0.06); border: 1px solid rgba(21,128,61,0.2); border-radius: 6px; margin: 0 2rem 1rem 2rem; font-size: 0.875rem; font-weight: 600; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: #fff; border-top: 1px solid #E8E8E8; border-bottom: 1px solid #E8E8E8; border-left: none; border-right: none; }
    .data-table th:first-child, .data-table td:first-child { padding-left: 2rem; }
    .data-table th:last-child, .data-table td:last-child { padding-right: 2rem; }
    .data-table th { text-align: left; padding: 0.65rem 0.875rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; background: #FAFAFA; border-bottom: 1px solid #E8E8E8; }
    .data-table td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; color: #333; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #F7F8FA; }
    .row-selected td { background: rgba(184,115,51,0.05) !important; }
    .cb { width: 15px; height: 15px; cursor: pointer; accent-color: #B87333; }
    .cust-name { font-weight: 600; color: #1C1C1C; }
    .cust-email { font-size: 0.75rem; color: #888; margin-top: 2px; }
    .muted { color: #888; }
    .muted-sm { font-size: 0.7rem; color: #888; margin-top: 2px; }
    .amount { font-weight: 600; color: #1C1C1C; }
    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; background: #F0F0F0; color: #888; }
    .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .pay-paid { background: rgba(21,128,61,0.09); color: #15803D; }
    .pay-pending { background: rgba(180,83,9,0.1); color: #B45309; }
    .pay-failed { background: rgba(220,38,38,0.09); color: #DC2626; }
    .inline-select { appearance: none; background: transparent; border: none; color: inherit; font-size: 0.78rem; font-weight: 600; padding: 5px 20px 5px 10px; cursor: pointer; outline: none; max-width: 170px; }
    .select-wrap--status { border-radius: 6px; background: #F0F0F0; color: #666; position: relative; display: inline-flex; align-items: center; }
    .select-wrap--status .select-caret { position: absolute; right: 6px; color: inherit; pointer-events: none; }
    .select-wrap--status.status-pending { background: rgba(180,83,9,0.1); color: #B45309; }
    .select-wrap--status.status-confirmed, .select-wrap--status.status-processing, .select-wrap--status.status-quality_check { background: rgba(29,78,216,0.1); color: #1D4ED8; }
    .select-wrap--status.status-shipped, .select-wrap--status.status-out_for_delivery { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .select-wrap--status.status-delivered { background: rgba(21,128,61,0.1); color: #15803D; }
    .select-wrap--status.status-cancelled, .select-wrap--status.status-refund_requested, .select-wrap--status.status-refunded, .select-wrap--status.status-returned { background: rgba(220,38,38,0.1); color: #DC2626; }
    .action-btns { display: flex; gap: 0.4rem; }
    .btn-sm { padding: 4px 10px; background: #F7F8FA; border: 1px solid #E8E8E8; color: #555; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: background 0.15s; }
    .btn-sm:hover { background: #F0F0F0; }
    .btn-view { display: inline-flex; align-items: center; gap: 0.35rem; padding: 5px 12px; background: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.3); color: #B87333; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: background 0.15s; }
    .btn-view:hover { background: rgba(184,115,51,0.15); }
    .btn-book { background: #B87333; color: #fff; border-color: #B87333; }
    .btn-book:hover { background: #9d5d22; border-color: #9d5d22; }
    .btn-tracking { background: #F7F8FA; border: 1px solid #E8E8E8; color: #555; }
    .btn-tracking:hover { background: #F0F0F0; }
    .btn-primary { padding: 0.5rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 0.5rem 1.25rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.875rem; cursor: pointer; transition: background 0.15s; }
    .btn-secondary:hover { background: #F7F8FA; }
    .empty-cell { text-align: center; color: #AAAAAA; padding: 3rem; }
    .empty-cell svg { margin-bottom: 0.5rem; }
    .pagination { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1.5rem; font-size: 0.875rem; color: #888; }
    .pagination button { padding: 0.4rem 0.75rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: background 0.15s; }
    .pagination button:hover { background: #F7F8FA; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Modal shared */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; width: 100%; max-width: 560px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
    .confirm-modal { max-width: 440px; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.25rem 1.5rem; border-bottom: 1px solid #E8E8E8; }
    .modal-header h2 { font-size: 1rem; font-weight: 700; color: #1C1C1C; margin: 0; }
    .modal-close { background: none; border: none; color: #888; font-size: 1rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: color 0.15s; flex-shrink: 0; }
    .modal-close:hover { color: #1C1C1C; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #E8E8E8; }

    /* Order detail modal */
    .detail-modal {
      background: #fff; border: 1px solid #E8E8E8; border-radius: 12px;
      width: 100%; max-width: 900px; max-height: 92vh;
      display: flex; flex-direction: column;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
    }
    .detail-loading { padding: 2rem; text-align: center; color: #888; }
    .header-meta { font-size: 0.78rem; color: #888; margin-top: 2px; display: flex; align-items: center; gap: 0.5rem; }
    .status-chip { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; background: #F0F0F0; color: #888; }
    .sc-pending { background: rgba(180,83,9,0.1); color: #B45309; }
    .sc-confirmed,.sc-processing,.sc-quality_check { background: rgba(37,99,235,0.08); color: #1D4ED8; }
    .sc-shipped,.sc-out_for_delivery { background: rgba(124,58,237,0.08); color: #6D28D9; }
    .sc-delivered { background: rgba(21,128,61,0.08); color: #15803D; }
    .sc-cancelled,.sc-returned { background: rgba(220,38,38,0.08); color: #DC2626; }
    .detail-body { padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; min-height: 0; }
    .detail-row-2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
    .detail-card { background: #FAFAFA; border: 1px solid #E8E8E8; border-radius: 8px; padding: 1rem; }
    .shipment-card { background: #fff; border-color: rgba(184,115,51,0.25); }
    .dc-title { font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #AAAAAA; margin-bottom: 0.5rem; }
    .dc-val { font-size: 0.8125rem; color: #4A5568; margin-top: 2px; }
    .fw { font-weight: 600; color: #1C1C1C !important; }

    /* Items table */
    .items-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; margin-top: 0.5rem; }
    .items-table th { text-align: left; padding: 0.4rem 0.5rem; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #888; border-bottom: 1px solid #E8E8E8; }
    .items-table td { padding: 0.6rem 0.5rem; border-bottom: 1px solid #F0F0F0; vertical-align: middle; }
    .items-table tr:last-child td { border-bottom: none; }
    .item-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid #E8E8E8; }
    .item-thumb-empty { width: 36px; height: 36px; background: #F0F0F0; border-radius: 4px; }
    .item-name { font-weight: 600; color: #1C1C1C; }
    .item-variant { font-size: 0.75rem; color: #888; margin-top: 1px; }

    /* Summary */
    .summary-card { grid-column: 1; }
    .summary-row { display: flex; justify-content: space-between; padding: 0.35rem 0; font-size: 0.8125rem; color: #4A5568; border-bottom: 1px solid #F0F0F0; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row.green { color: #15803D; }
    .summary-row.total { font-weight: 700; color: #1C1C1C; font-size: 0.9375rem; border-top: 1px solid #E8E8E8; padding-top: 0.5rem; margin-top: 0.25rem; border-bottom: none; }

    /* Track link */
    .track-link { font-size: 0.75rem; color: #B87333; font-weight: 600; text-decoration: underline; display: inline-block; margin-top: 0.25rem; }

    /* Timeline */
    .timeline { display: flex; flex-direction: column; gap: 0; }
    .tl-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.4rem 0; position: relative; }
    .tl-item:not(:last-child)::after { content: ''; position: absolute; left: 7px; top: 24px; bottom: -4px; width: 2px; background: #E8E8E8; }
    .tl-item.tl-done::after { background: #15803D; }
    .tl-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #E8E8E8; background: #fff; flex-shrink: 0; margin-top: 1px; }
    .tl-item.tl-done .tl-dot { background: #15803D; border-color: #15803D; }
    .tl-item.tl-active .tl-dot { background: #B87333; border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.2); }
    .tl-label { font-size: 0.78rem; font-weight: 600; color: #888; }
    .tl-item.tl-done .tl-label, .tl-item.tl-active .tl-label { color: #1C1C1C; }
    .tl-date { font-size: 0.68rem; color: #AAAAAA; margin-top: 1px; }

    /* Shiprocket section */
    .ship-meta { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.78rem; color: #555; margin-bottom: 1rem; }
    .couriers-loading { font-size: 0.8rem; color: #888; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; }
    .couriers-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto; }
    .courier-card { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0.875rem; border: 1.5px solid #E8E8E8; border-radius: 6px; cursor: pointer; background: #FAFAFA; transition: border-color 0.15s; }
    .courier-card:hover { border-color: #B87333; background: #fff; }
    .courier-name { font-weight: 600; color: #1C1C1C; font-size: 0.875rem; }
    .courier-meta { font-size: 0.72rem; color: #888; margin-top: 2px; display: flex; gap: 0.75rem; align-items: center; }
    .cod-tag { padding: 1px 5px; border-radius: 3px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; background: rgba(220,38,38,0.08); color: #DC2626; }
    .cod-tag.cod-yes { background: rgba(21,128,61,0.08); color: #15803D; }
    .courier-right { text-align: right; }
    .courier-rate { font-weight: 700; color: #B87333; font-size: 0.9375rem; }
    .btn-book-sm { padding: 4px 10px; background: #B87333; color: #fff; border: none; border-radius: 4px; font-size: 0.72rem; font-weight: 600; cursor: pointer; margin-top: 0.25rem; }
    .btn-book-sm:hover:not(:disabled) { background: #9d5d22; }
    .btn-book-sm:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Active shipment card in manual tracking modal */
    .active-shipment-card { padding: 1rem; border: 1.5px solid #276749; border-radius: 8px; background: rgba(39,103,73,0.04); margin-bottom: 1.25rem; }

    /* Form */
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; }
    .form-input { padding: 0.5rem 0.75rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 6px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.15s; }
    .form-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-input::placeholder { color: #AAAAAA; }

    .spinner-sm { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(184,115,51,0.2); border-top-color: #B87333; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
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
  private searchTimer: any;

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
    this.api.get<any>('/orders/status-counts').subscribe({
      next: (res) => this.statusCounts.set(res.data || {}),
      error: () => {}
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const params: any = { page: this.page(), limit: 20 };
    if (this.searchQ.trim()) params['search'] = this.searchQ.trim();
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.api.get<any>('/orders', params).subscribe({
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
    this.api.patch<any>(`/orders/${o.id}/status`, { status: o.status }).subscribe({
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

    const reqs = ids.map(id => this.api.patch<any>(`/orders/${id}/status`, { status: newStatus }).toPromise().catch(() => null));
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
