import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminConfirmService } from '../shared/admin-confirm.service';
import { AdminToastService } from '../shared/admin-toast.service';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  display_order: number;
  product_count?: number;
}

const EMPTY_FORM = () => ({ name: '', description: '', image_url: '', display_order: '0', status: 'active' });
const DEDICATED_SLUGS = ['hair-wigs', 'hair-patches'];

@Component({
  selector: 'lk-admin-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Categories <span class="count">{{ visibleCategories().length }}</span></h1>
        <button class="btn-primary" (click)="openCreate()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          Add Category
        </button>
      </div>

      <div class="info-note">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.3" stroke="currentColor" stroke-width="1.2"/><path d="M8 7.2V11.5M8 5V5.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        Hair Wigs and Hair Patches are managed as dedicated modules and are excluded from this list.
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
              <option value="">Bulk Action...</option>
              <option value="active">Activate Selected</option>
              <option value="inactive">Deactivate Selected</option>
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
            @for (i of [1,2,3,4,5]; track i) {
              <tr class="skel-row">
                <td style="width:36px"></td>
                <td><div class="prod-cell"><div class="skel-thumb"></div><div style="flex:1"><div class="skel-line" style="width:60%;margin-bottom:6px"></div><div class="skel-line" style="width:40%;height:8px"></div></div></div></td>
                <td><div class="skel-line" style="width:40%"></div></td>
                <td><div class="skel-line" style="width:30%"></div></td>
                <td><div class="skel-line" style="width:30%"></div></td>
                <td><div class="skel-line" style="width:50%"></div></td>
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
              <th>Category</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Order</th>
              <th>Status</th>
              <th class="ta-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (cat of visibleCategories(); track cat.id) {
              <tr [class.row-selected]="selectedIds().has(cat.id)">
                <td><input type="checkbox" class="cb" [checked]="selectedIds().has(cat.id)" (change)="toggleSelect(cat.id)" /></td>
                <td>
                  <div class="prod-cell">
                    @if (cat.image_url) {
                      <img [src]="imgUrl(cat.image_url)" class="thumb" [alt]="cat.name" />
                    } @else {
                      <div class="thumb-empty">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5C2 3.9 2.9 3 4 3H7L9 5H14C15.1 5 16 5.9 16 7V14C16 15.1 15.1 16 14 16H4C2.9 16 2 15.1 2 14V5Z" stroke="currentColor" stroke-width="1.2"/></svg>
                      </div>
                    }
                    <div class="prod-info">
                      <div class="cat-name">{{ cat.name }}</div>
                      @if (cat.description) { <div class="cat-desc">{{ cat.description }}</div> }
                    </div>
                  </div>
                </td>
                <td><span class="slug-chip">{{ cat.slug }}</span></td>
                <td>
                  <span class="count-chip">{{ cat.product_count ?? 0 }}</span>
                </td>
                <td class="muted">{{ cat.display_order }}</td>
                <td>
                  <span class="badge" [class.badge-active]="cat.status === 'active'" [class.badge-inactive]="cat.status !== 'active'">
                    <span class="badge-dot"></span>{{ cat.status }}
                  </span>
                </td>
                <td class="ta-right">
                  <div class="action-btns">
                    <button class="icon-btn icon-btn--edit" (click)="openEdit(cat)" title="Edit" aria-label="Edit">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="icon-btn icon-btn--delete" (click)="confirmDelete(cat)" title="Delete" aria-label="Delete">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 4.5H13M6 4.5V3C6 2.4 6.4 2 7 2H9C9.6 2 10 2.4 10 3V4.5M12 4.5V13C12 13.6 11.6 14 11 14H5C4.4 14 4 13.6 4 13V4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (!visibleCategories().length) {
              <tr><td colspan="7" class="empty-cell">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 10C4 7.8 5.8 6 8 6H14L18 10H28C30.2 10 32 11.8 32 14V26C32 28.2 30.2 30 28 30H8C5.8 30 4 28.2 4 26V10Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" transform="translate(-2,0)"/></svg>
                <div>No categories found</div>
              </td></tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- Create / Edit Modal -->
    @if (showForm()) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 5C2 3.9 2.9 3 4 3H7L9 5H14C15.1 5 16 5.9 16 7V14C16 15.1 15.1 16 14 16H4C2.9 16 2 15.1 2 14V5Z" stroke="currentColor" stroke-width="1.3"/></svg></span>
              {{ editingId() ? 'Edit Category' : 'Add Category' }}
            </h2>
            <button class="modal-close" (click)="closeForm()">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field field-full">
                <label>Category Name *</label>
                <input type="text" [(ngModel)]="form().name" class="form-input" placeholder="e.g. Hair Care" />
              </div>
              <div class="field field-full">
                <label>Description</label>
                <input type="text" [(ngModel)]="form().description" class="form-input" placeholder="Short description..." />
              </div>
              <div class="field field-full">
                <label>Category Image</label>
                <div class="img-upload-zone">
                  @if (catImgPreview()) {
                    <div class="img-preview-wrap">
                      <img [src]="catImgPreview()" class="img-preview" alt="Category preview" />
                      <button type="button" class="img-remove-btn" (click)="removeImage()">
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                        Remove
                      </button>
                    </div>
                  }
                  <label class="img-upload-btn">
                    <input type="file" accept="image/*" (change)="onImagePick($event)" style="display:none" />
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    {{ catImgPreview() ? 'Change Image' : 'Upload Image' }}
                  </label>
                </div>
              </div>
              <div class="field">
                <label>Display Order</label>
                <input type="number" [(ngModel)]="form().display_order" class="form-input" placeholder="0" />
              </div>
              <div class="field">
                <label>Status</label>
                <div class="select-wrap">
                  <select [(ngModel)]="form().status" class="form-input form-select">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <svg class="select-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </div>
            </div>
            @if (formError()) { <div class="error-msg" style="margin-top:1rem">{{ formError() }}</div> }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button class="btn-primary" (click)="saveCategory()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (editingId() ? 'Update Category' : 'Create Category') }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showBulkConfirm()) {
      <div class="modal-backdrop" (click)="showBulkConfirm.set(false)">
        <div class="modal" style="max-width:440px" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Confirm Bulk Action</h2>
            <button class="modal-close" (click)="showBulkConfirm.set(false)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p>Apply <strong>{{ bulkActionLabel() }}</strong> to <strong>{{ selectedIds().size }}</strong> categories?</p>
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
    .page { padding: 2rem; max-width: 100%; }
    .info-note { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #888; background: #F7F8FA; border: 1px solid #E8E8E8; border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1rem; }
    .bulk-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; background: linear-gradient(rgba(184,115,51,0.08), rgba(184,115,51,0.08)), #F3EFE8; border: 1px solid rgba(184,115,51,0.3); border-radius: 8px; margin-bottom: 1rem; }
    .bulk-count { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700; color: #B87333; }
    .select-wrap--bulk { position: relative; display: flex; align-items: center; }
    .select-wrap--bulk .bulk-select { padding: 0.4rem 1.7rem 0.4rem 0.65rem; border: 1px solid #E0D8C8; border-radius: 6px; font-size: 0.8rem; outline: none; background: #fff; appearance: none; cursor: pointer; }
    .select-wrap--bulk .select-caret { position: absolute; right: 0.6rem; color: #999; pointer-events: none; }
    .btn-bulk-apply { padding: 0.4rem 0.9rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-bulk-apply:hover { opacity: 0.9; }
    .btn-bulk-apply:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-bulk-clear { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem; background: none; border: 1px solid #E0D8C8; color: #888; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: background 0.15s; }
    .btn-bulk-clear:hover { background: rgba(0,0,0,0.03); }
    .cb { width: 15px; height: 15px; cursor: pointer; accent-color: #B87333; }
    .row-selected td { background: rgba(184,115,51,0.05) !important; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.375rem; font-weight: 700; color: #1C1C1C; margin: 0; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.01em; }
    .count { font-size: 0.8rem; font-weight: 500; color: #888; background: #F0F0F0; padding: 2px 8px; border-radius: 20px; }
    .error-msg { color: #DC2626; padding: 0.75rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    .skel-row td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; }
    .skel-thumb { width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(90deg, #F0F0F0 25%, #F7F7F7 37%, #F0F0F0 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
    .skel-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg, #F0F0F0 25%, #F7F7F7 37%, #F0F0F0 63%); background-size: 400% 100%; animation: skel-shimmer 1.4s ease infinite; }
    @keyframes skel-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
    .error-msg button { margin-left: 1rem; background: none; border: 1px solid #DC2626; color: #DC2626; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; }
    .data-table th { text-align: left; padding: 0.65rem 0.875rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; background: #FAFAFA; border-bottom: 1px solid #E8E8E8; }
    .data-table td { padding: 0.7rem 0.875rem; border-bottom: 1px solid #F0F0F0; color: #333; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #F7F8FA; }
    .ta-right { text-align: right; }
    .prod-cell { display: flex; align-items: center; gap: 0.75rem; }
    .prod-info { min-width: 0; }
    .thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; border: 1px solid #E8E8E8; flex-shrink: 0; }
    .thumb-empty { width: 40px; height: 40px; background: #F0F0F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #BBBBBB; flex-shrink: 0; }
    .cat-name { font-weight: 600; color: #1C1C1C; }
    .cat-desc { font-size: 0.75rem; color: #888; margin-top: 2px; }
    .muted { color: #888; }
    .slug-chip { display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 0.72rem; color: #6B5D4D; background: #F0EBE1; }
    .count-chip { display: inline-block; min-width: 22px; text-align: center; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: #555; background: #F0F0F0; }
    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; background: #F0F0F0; color: #888; }
    .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .badge-active { background: rgba(21,128,61,0.09); color: #15803D; }
    .badge-inactive { background: rgba(220,38,38,0.09); color: #DC2626; }
    .action-btns { display: flex; gap: 0.4rem; justify-content: flex-end; }
    .icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
    .icon-btn--edit { background: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.3); color: #B87333; }
    .icon-btn--edit:hover { background: rgba(184,115,51,0.16); }
    .icon-btn--delete { background: none; border: 1px solid rgba(220,38,38,0.3); color: #DC2626; }
    .icon-btn--delete:hover { background: rgba(220,38,38,0.08); }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.25rem; background: #fff; border: 1px solid #E0D8C8; color: #555; border-radius: 8px; font-size: 0.875rem; cursor: pointer; transition: background 0.15s; }
    .btn-secondary:hover { background: #F7F8FA; }
    .empty-cell { text-align: center; color: #AAAAAA; padding: 3rem; }
    .empty-cell svg { margin-bottom: 0.5rem; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #E8E8E8; }
    .modal-header h2 { display: flex; align-items: center; gap: 0.6rem; font-size: 1rem; font-weight: 700; color: #1C1C1C; margin: 0; }
    .card-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 7px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
    .modal-close { display: flex; background: none; border: none; color: #888; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.15s, color 0.15s; }
    .modal-close:hover { color: #1C1C1C; background: #F7F8FA; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #E8E8E8; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field-full { grid-column: 1 / -1; }
    .field label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; }
    .form-input { padding: 0.55rem 0.75rem; background: #fff; border: 1px solid #E0D8C8; border-radius: 8px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; }
    .form-input:hover { border-color: #D0C4AE; }
    .form-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-input::placeholder { color: #AAAAAA; }
    .form-select { appearance: none; padding-right: 2rem; cursor: pointer; }
    .select-wrap { position: relative; display: flex; align-items: center; }
    .select-wrap .select-caret { position: absolute; right: 0.85rem; color: #999; pointer-events: none; }
    .img-upload-zone { display: flex; flex-direction: column; gap: 0.75rem; }
    .img-preview-wrap { display: flex; align-items: center; gap: 1rem; }
    .img-preview { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #E8E8E8; }
    .img-remove-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 4px 10px; background: none; border: 1px solid rgba(220,38,38,0.3); color: #DC2626; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: background 0.15s; }
    .img-remove-btn:hover { background: rgba(220,38,38,0.06); }
    .img-upload-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: 1px dashed rgba(184,115,51,0.5); border-radius: 8px; color: #B87333; font-size: 0.8rem; font-weight: 600; cursor: pointer; background: rgba(184,115,51,0.04); transition: background 0.15s, border-color 0.15s; }
    .img-upload-btn:hover { background: rgba(184,115,51,0.1); border-color: #B87333; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly confirmSvc = inject(AdminConfirmService);
  private readonly toast = inject(AdminToastService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');

  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  formError = signal('');
  form = signal(EMPTY_FORM());
  catImgPreview = signal<string>('');
  catImgFile = signal<File | null>(null);
  readonly imgUrl = imageUrl;

  // Bulk (P3)
  selectedIds = signal<Set<number>>(new Set());
  bulkAction = '';
  showBulkConfirm = signal(false);
  bulkRunning = signal(false);

  readonly visibleCategories = computed(() =>
    this.categories().filter(c => !DEDICATED_SLUGS.includes(c.slug))
  );

  readonly allSelected = computed(() => {
    const ids = this.visibleCategories().map(c => c.id);
    const sel = this.selectedIds();
    return ids.length > 0 && ids.every(id => sel.has(id));
  });

  readonly bulkActionLabel = computed(() => {
    const map: Record<string, string> = { active: 'Activate', inactive: 'Deactivate', delete: 'Delete' };
    return map[this.bulkAction] || this.bulkAction;
  });

  ngOnInit(): void { this.load(); }

  toggleSelect(id: number): void {
    this.selectedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.visibleCategories().map(c => c.id)));
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
      reqs = ids.map(id => this.api.delete<any>(`/admin/categories/${id}`).toPromise().catch(() => null));
    } else {
      const status = this.bulkAction;
      reqs = ids.map(id => this.api.put<any>(`/admin/categories/${id}`, { status }).toPromise().catch(() => null));
    }
    Promise.all(reqs).then(() => {
      this.bulkRunning.set(false);
      this.showBulkConfirm.set(false);
      this.clearSelection();
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.get<any>('/admin/categories').subscribe({
      next: (res) => { this.categories.set(res.data || []); this.loading.set(false); },
      error: (err) => { this.error.set(err.userMessage || 'Failed to load categories'); this.loading.set(false); }
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.set(EMPTY_FORM());
    this.formError.set('');
    this.catImgPreview.set('');
    this.catImgFile.set(null);
    this.showForm.set(true);
  }

  openEdit(cat: Category): void {
    this.editingId.set(cat.id);
    this.form.set({
      name: cat.name, description: cat.description || '',
      image_url: cat.image_url || '', display_order: String(cat.display_order),
      status: cat.status
    });
    this.formError.set('');
    this.catImgPreview.set(imageUrl(cat.image_url));
    this.catImgFile.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.catImgPreview.set('');
    this.catImgFile.set(null);
  }

  onImagePick(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.catImgFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.catImgPreview.set(e.target!.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.catImgPreview.set('');
    this.catImgFile.set(null);
    this.form.update(f => ({ ...f, image_url: '' }));
  }

  saveCategory(): void {
    const f = this.form();
    if (!f.name.trim()) { this.formError.set('Category name is required'); return; }

    this.saving.set(true);
    this.formError.set('');

    const payload = {
      name: f.name.trim(),
      description: f.description || null,
      display_order: Number(f.display_order) || 0,
      status: f.status
    };

    const editId = this.editingId();
    const req = editId
      ? this.api.put<any>(`/admin/categories/${editId}`, payload)
      : this.api.post<any>('/admin/categories', payload);

    req.subscribe({
      next: (res: any) => {
        const savedId: number = res.data?.id ?? editId;
        const file = this.catImgFile();
        if (file && savedId) {
          const fd = new FormData();
          fd.append('image', file);
          this.api.uploadFormData<any>(`/categories/${savedId}/upload-image`, fd).subscribe({
            next: () => { this.saving.set(false); this.showForm.set(false); this.catImgFile.set(null); this.toast.success(editId ? 'Category updated' : 'Category created'); this.load(); },
            error: (err: any) => { this.saving.set(false); this.formError.set(err.userMessage || 'Image upload failed'); }
          });
        } else {
          this.saving.set(false);
          this.showForm.set(false);
          this.toast.success(editId ? 'Category updated' : 'Category created');
          this.load();
        }
      },
      error: (err: any) => { this.saving.set(false); this.formError.set(err.userMessage || 'Save failed'); }
    });
  }

  async confirmDelete(cat: Category): Promise<void> {
    const ok = await this.confirmSvc.confirm({
      title: 'Delete Category',
      message: `Delete "${cat.name}"? Products in this category will be unassigned.`,
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    this.api.delete<any>(`/admin/categories/${cat.id}`).subscribe({
      next: () => { this.toast.success('Category deleted'); this.load(); },
      error: (err) => this.toast.error(err.userMessage || 'Delete failed')
    });
  }
}
