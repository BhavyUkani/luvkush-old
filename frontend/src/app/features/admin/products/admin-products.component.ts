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
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Products <span class="count">{{ total() }}</span></h1>
      </div>

      <!-- Status Cards -->
      <div class="status-cards">
        <div class="status-card" [class.card-active]="statusFilter === ''" (click)="filterStatus('')">
          <div class="card-icon card-icon--info">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.3" stroke="currentColor" stroke-width="1.3"/><rect x="11" y="2" width="7" height="7" rx="1.3" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="11" width="7" height="7" rx="1.3" stroke="currentColor" stroke-width="1.3"/><rect x="11" y="11" width="7" height="7" rx="1.3" stroke="currentColor" stroke-width="1.3"/></svg>
          </div>
          <div class="card-stats">
            <div class="card-val">{{ stats()?.total ?? 0 }}</div>
            <div class="card-label">Total Products</div>
          </div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'active'" (click)="filterStatus('active')">
          <div class="card-icon card-icon--success">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 10L8.7 12.2L13.5 7.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="card-stats">
            <div class="card-val">{{ stats()?.active ?? 0 }}</div>
            <div class="card-label">Active</div>
          </div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'inactive'" (click)="filterStatus('inactive')">
          <div class="card-icon card-icon--warn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.8 10H13.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </div>
          <div class="card-stats">
            <div class="card-val">{{ stats()?.inactive ?? 0 }}</div>
            <div class="card-label">Inactive</div>
          </div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'draft'" (click)="filterStatus('draft')">
          <div class="card-icon card-icon--purple">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 3.5L16.5 7.5L7 17H3V13L12.5 3.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10.5 5.5L14.5 9.5" stroke="currentColor" stroke-width="1.3"/></svg>
          </div>
          <div class="card-stats">
            <div class="card-val">{{ stats()?.draft ?? 0 }}</div>
            <div class="card-label">Drafts</div>
          </div>
        </div>
        <div class="status-card" [class.card-active]="statusFilter === 'archived'" (click)="filterStatus('archived')">
          <div class="card-icon card-icon--muted">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="4" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 8V15C3.5 15.8 4.2 16.5 5 16.5H15C15.8 16.5 16.5 15.8 16.5 15V8" stroke="currentColor" stroke-width="1.3"/><path d="M8 11H12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          </div>
          <div class="card-stats">
            <div class="card-val">{{ stats()?.archived ?? 0 }}</div>
            <div class="card-label">Archived</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.4"/><path d="M11 11L14.5 14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input type="text" class="search-input" placeholder="Search by name or SKU..." [(ngModel)]="searchQ" (input)="onSearch()" />
        </div>
        <div class="select-wrap">
          <select class="filter-select" [(ngModel)]="statusFilter" (change)="load()">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <svg class="select-caret" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="select-wrap">
          <select class="filter-select" [(ngModel)]="categoryFilter" (change)="onCategoryChange()">
            <option value="">All Categories</option>
            @for (cat of filteredCategories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
          <svg class="select-caret" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <button class="btn-primary" (click)="createProduct()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          Add Product
        </button>
      </div>

      @if (selectedIds().size > 0) {
        <div class="bulk-bar">
          <div class="bulk-count">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ selectedIds().size }} selected
          </div>
          <div class="select-wrap select-wrap--bulk">
            <select class="bulk-select" [(ngModel)]="bulkAction">
              <option value="">Bulk Action...</option>
              <option value="active">Activate Selected</option>
              <option value="draft">Deactivate Selected</option>
              <option value="delete">Delete Selected</option>
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
            @for (i of [1,2,3,4,5,6]; track i) {
              <tr class="skel-row">
                <td style="width:36px"></td>
                <td><div class="prod-cell"><div class="skel-thumb"></div><div style="flex:1"><div class="skel-line" style="width:70%;margin-bottom:6px"></div><div class="skel-line" style="width:40%;height:8px"></div></div></div></td>
                <td><div class="skel-line" style="width:50%"></div></td>
                <td><div class="skel-line" style="width:40%"></div></td>
                <td><div class="skel-line" style="width:30%"></div></td>
                <td><div class="skel-line" style="width:60%"></div></td>
                <td><div class="skel-line" style="width:30%"></div></td>
                <td><div class="skel-line" style="width:70%"></div></td>
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
              <th style="width:36px"><input type="checkbox" class="cb" [checked]="allSelected()" (change)="toggleSelectAll()" /></th>
              <th>Product</th><th>Category</th><th>Price</th>
              <th>Stock</th><th>Status</th><th class="ta-center">Featured</th><th class="ta-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr [class.row-selected]="selectedIds().has(p.id)" [class.row-draft]="p.status === 'draft'">
                <td><input type="checkbox" class="cb" [checked]="selectedIds().has(p.id)" (change)="toggleSelect(p.id)" /></td>
                <td>
                  <div class="prod-cell">
                    @if (p.primary_image) {
                      <img [src]="imgUrl(p.primary_image)" class="thumb" [alt]="p.name" />
                    } @else {
                      <div class="thumb-empty">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2H14V14H2V2Z" stroke="currentColor" stroke-width="1.2"/><path d="M2 10.5L5.5 7L8.5 10L11 7.5L14 10.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="5.5" cy="5" r="1.2" stroke="currentColor" stroke-width="1.1"/></svg>
                      </div>
                    }
                    <div class="prod-info">
                      <div class="product-name">{{ p.name }}</div>
                      @if (p.subtitle) { <div class="product-sub">{{ p.subtitle }}</div> }
                      <div class="product-sku">{{ p.sku }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  @if (p.category_name) {
                    <span class="cat-chip">{{ p.category_name }}</span>
                  } @else {
                    <span class="muted">—</span>
                  }
                </td>
                <td>
                  <div class="price-cell">₹{{ p.price ?? 0 | inr:false }}</div>
                  @if (p.mrp > p.price) {
                    <div class="price-sub">
                      <span class="mrp">₹{{ p.mrp ?? 0 | inr:false }}</span>
                      <span class="discount-chip">{{ discountPct(p) }}% off</span>
                    </div>
                  }
                </td>
                <td>
                  <span class="stock-chip"
                    [class.stock-chip--low]="p.stock_quantity > 0 && p.stock_quantity <= 5"
                    [class.stock-chip--out]="p.stock_quantity === 0">
                    <span class="stock-dot"></span>{{ p.stock_quantity }}
                  </span>
                </td>
                <td>
                  <div class="select-wrap select-wrap--status" [class]="'status-' + p.status">
                    <select class="inline-select" [(ngModel)]="p.status" (change)="changeStatus(p)">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                    <svg class="select-caret" width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </td>
                <td class="ta-center">
                  <button class="star-btn" [class.star-btn--active]="p.is_featured" (click)="toggleFeatured(p)"
                    [attr.aria-label]="p.is_featured ? 'Remove from featured' : 'Mark as featured'"
                    [attr.title]="p.is_featured ? 'Featured' : 'Not featured'">
                    <svg width="17" height="17" viewBox="0 0 20 20" [attr.fill]="p.is_featured ? 'currentColor' : 'none'"><path d="M10 1.5L12.4 7.1L18.5 7.7L13.9 11.7L15.3 17.7L10 14.5L4.7 17.7L6.1 11.7L1.5 7.7L7.6 7.1L10 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                  </button>
                </td>
                <td class="ta-right">
                  <div class="action-btns">
                    <button class="icon-btn icon-btn--edit" (click)="editProduct(p.id)" title="Edit" aria-label="Edit">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="icon-btn icon-btn--delete" (click)="confirmDelete(p)" title="Delete" aria-label="Delete">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 4.5H13M6 4.5V3C6 2.4 6.4 2 7 2H9C9.6 2 10 2.4 10 3V4.5M12 4.5V13C12 13.6 11.6 14 11 14H5C4.4 14 4 13.6 4 13V4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (!products().length) {
              <tr><td colspan="8" class="empty-cell">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 9L16 4L28 9V23L16 28L4 23V9Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 9L16 14L28 9M16 14V28" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                <div>No products found</div>
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
    .filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: stretch; }
    .search-wrap { position: relative; flex: 1; min-width: 220px; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 0.75rem; color: #AAAAAA; pointer-events: none; }
    .search-input { width: 100%; padding: 0.55rem 0.75rem 0.55rem 2.15rem; background: #fff; border: 1px solid #E0D8C8; border-radius: 8px; color: #333; font-size: 0.875rem; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; }
    .search-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .search-input::placeholder { color: #AAAAAA; }
    .select-wrap { position: relative; display: flex; align-items: center; }
    .filter-select { appearance: none; padding: 0.55rem 1.9rem 0.55rem 0.85rem; background: #fff; border: 1px solid #E0D8C8; border-radius: 8px; color: #333; font-size: 0.875rem; outline: none; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; }
    .filter-select:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .select-caret { position: absolute; right: 0.7rem; color: #999; pointer-events: none; }
    .bulk-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; background: linear-gradient(rgba(184,115,51,0.08), rgba(184,115,51,0.08)), #F3EFE8; border: 1px solid rgba(184,115,51,0.3); border-radius: 8px; margin-bottom: 1rem; }
    .bulk-count { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700; color: #B87333; }
    .select-wrap--bulk .bulk-select { padding: 0.4rem 1.7rem 0.4rem 0.65rem; border: 1px solid #E0D8C8; border-radius: 6px; font-size: 0.8rem; outline: none; background: #fff; appearance: none; cursor: pointer; }
    .select-wrap--bulk .select-caret { right: 0.6rem; }
    .btn-bulk-apply { padding: 0.4rem 0.9rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-bulk-apply:hover { opacity: 0.9; }
    .btn-bulk-apply:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-bulk-clear { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem; background: none; border: 1px solid #E0D8C8; color: #888; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: background 0.15s; }
    .btn-bulk-clear:hover { background: rgba(0,0,0,0.03); }
    .error-msg { color: #DC2626; padding: 0.75rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; font-size: 0.875rem; }
    .skel-row td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; }
    .skel-thumb { width: 44px; height: 44px; border-radius: 6px; background: linear-gradient(90deg, #F0F0F0 25%, #F7F7F7 37%, #F0F0F0 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
    .skel-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg, #F0F0F0 25%, #F7F7F7 37%, #F0F0F0 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
    @keyframes skel-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
    .error-msg button { margin-left: 1rem; background: none; border: 1px solid #DC2626; color: #DC2626; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; }
    .data-table th { text-align: left; padding: 0.65rem 0.875rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; background: #FAFAFA; border-bottom: 1px solid #E8E8E8; }
    .data-table td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; color: #333; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #F7F8FA; }
    .row-selected td { background: rgba(184,115,51,0.05) !important; }
    .cb { width: 15px; height: 15px; cursor: pointer; accent-color: #B87333; }
    .ta-center { text-align: center; }
    .ta-right { text-align: right; }
    .prod-cell { display: flex; align-items: center; gap: 0.75rem; }
    .prod-info { min-width: 0; }
    .thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #E8E8E8; flex-shrink: 0; }
    .thumb-empty { width: 44px; height: 44px; background: #F0F0F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #BBBBBB; flex-shrink: 0; }
    .product-name { font-weight: 600; color: #1C1C1C; }
    .product-sub { font-size: 0.72rem; color: #888; margin-top: 1px; }
    .product-sku { font-size: 0.68rem; color: #AAAAAA; margin-top: 2px; font-family: monospace; }
    .cat-chip { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; background: #F0EBE1; color: #6B5D4D; }
    .price-cell { font-weight: 600; color: #1C1C1C; }
    .price-sub { display: flex; align-items: center; gap: 0.4rem; margin-top: 2px; }
    .mrp { font-size: 0.75rem; color: #AAAAAA; text-decoration: line-through; }
    .discount-chip { font-size: 0.65rem; font-weight: 700; color: #15803D; background: rgba(21,128,61,0.09); padding: 1px 6px; border-radius: 10px; }
    .muted { color: #888; }
    .stock-chip { display: inline-flex; align-items: center; gap: 0.4rem; padding: 3px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #15803D; background: rgba(21,128,61,0.08); }
    .stock-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .stock-chip--low { color: #B45309; background: rgba(180,83,9,0.09); }
    .stock-chip--out { color: #DC2626; background: rgba(220,38,38,0.09); }
    .inline-select { appearance: none; background: transparent; border: none; color: inherit; font-size: 0.8rem; font-weight: 600; padding: 5px 20px 5px 10px; cursor: pointer; outline: none; }
    .select-wrap--status { border-radius: 6px; background: #F0F0F0; color: #666; }
    .select-wrap--status .select-caret { right: 6px; color: inherit; }
    .select-wrap--status.status-active { background: rgba(21,128,61,0.1); color: #15803D; }
    .select-wrap--status.status-inactive { background: rgba(180,83,9,0.1); color: #B45309; }
    .select-wrap--status.status-draft { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .select-wrap--status.status-archived { background: rgba(75,85,99,0.1); color: #4B5563; }
    .star-btn { background: none; border: none; padding: 4px; cursor: pointer; color: #D0D0D0; display: inline-flex; transition: color 0.15s, transform 0.15s; }
    .star-btn:hover { color: #E0B074; transform: scale(1.1); }
    .star-btn--active { color: #B87333; }
    .action-btns { display: flex; gap: 0.4rem; justify-content: flex-end; }
    .icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
    .icon-btn--edit { background: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.3); color: #B87333; }
    .icon-btn--edit:hover { background: rgba(184,115,51,0.16); }
    .icon-btn--delete { background: none; border: 1px solid rgba(220,38,38,0.3); color: #DC2626; }
    .icon-btn--delete:hover { background: rgba(220,38,38,0.08); }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; white-space: nowrap; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-danger { background: #DC2626 !important; }
    .btn-secondary { padding: 0.5rem 1.25rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.875rem; cursor: pointer; }
    .empty-cell { text-align: center; color: #AAAAAA; padding: 3rem; }
    .empty-cell svg { margin-bottom: 0.5rem; }
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
    .status-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .status-card { background: #fff; border: 1px solid #E0D8C8; border-radius: 10px; padding: 1rem 1.1rem; cursor: pointer; transition: all 0.18s ease; display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; }
    .status-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.06); border-color: #C9BEA8; }
    .status-card.card-active { border-color: #B87333; box-shadow: 0 0 0 2px rgba(184,115,51,0.14); background: #FAF8F5; }
    .card-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; flex-shrink: 0; color: inherit; }
    .card-icon--info { background: rgba(29,78,216,0.1); color: #1D4ED8; }
    .card-icon--success { background: rgba(21,128,61,0.1); color: #15803D; }
    .card-icon--warn { background: rgba(180,83,9,0.12); color: #B45309; }
    .card-icon--purple { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .card-icon--muted { background: rgba(75,85,99,0.1); color: #4B5563; }
    .card-stats { display: flex; flex-direction: column; align-items: flex-end; text-align: right; min-width: 0; }
    .card-val { font-size: 1.4rem; font-weight: 800; color: #1C1C1C; line-height: 1.15; }
    .card-label { font-size: 0.72rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 1px; }
    .row-draft td { color: #999 !important; background: #FAFAFA; }
    .row-draft .product-name { color: #888; }
    .row-draft img { opacity: 0.5; filter: grayscale(100%); }
  `]
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
