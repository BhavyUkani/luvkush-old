import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface OrderStatus {
  id: number;
  name: string;
  slug: string;
  color: string;
  sort_order: number;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

const EMPTY_FORM = () => ({ name: '', color: '#B87333' });

@Component({
  selector: 'lk-admin-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-container">
        <!-- Tabs Sidebar -->
        <aside class="settings-tabs">
          <button 
            class="tab-btn" 
            [class.tab-btn--active]="activeTab() === 'statuses'" 
            (click)="activeTab.set('statuses')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="tab-icon">
              <path d="M1 4.5H15M1 8H15M1 11.5H15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <circle cx="3" cy="4.5" r="1" fill="currentColor"/>
              <circle cx="7" cy="8" r="1" fill="currentColor"/>
              <circle cx="11" cy="11.5" r="1" fill="currentColor"/>
            </svg>
            Order Statuses
          </button>
        </aside>

        <!-- Tab Content -->
        <main class="settings-content">
          @if (activeTab() === 'statuses') {
            <div class="tab-pane">
              <div class="pane-header">
                <div>
                  <h2>Order Lifecycle Statuses</h2>
                  <p class="pane-desc">Manage order status flow. Reorder items to adjust how steps appear on user tracking timelines.</p>
                </div>
                <button class="btn-primary" (click)="openCreate()">+ Add Custom Status</button>
              </div>

              @if (loading()) {
                <div class="loading">Loading statuses...</div>
              } @else if (error()) {
                <div class="error-msg">
                  <span>{{ error() }}</span>
                  <button (click)="loadStatuses()">Retry</button>
                </div>
              } @else {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 100px; text-align: center;">Reorder</th>
                      <th>Status Name</th>
                      <th>Slug (Code)</th>
                      <th>Color Badge</th>
                      <th>Type</th>
                      <th style="width: 140px; text-align: right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (status of statuses(); track status.id; let first = $first; let last = $last; let idx = $index) {
                      <tr>
                        <!-- Reordering Actions -->
                        <td>
                          <div class="reorder-btns">
                            <button 
                              class="btn-arrow" 
                              [disabled]="first" 
                              (click)="moveStatus(idx, -1)" 
                              title="Move Up">
                              ▲
                            </button>
                            <button 
                              class="btn-arrow" 
                              [disabled]="last" 
                              (click)="moveStatus(idx, 1)" 
                              title="Move Down">
                              ▼
                            </button>
                          </div>
                        </td>

                        <!-- Name -->
                        <td>
                          <span class="status-title">{{ status.name }}</span>
                        </td>

                        <!-- Slug -->
                        <td class="muted font-mono">
                          {{ status.slug }}
                        </td>

                        <!-- Color Badge Preview -->
                        <td>
                          <span 
                            class="status-badge" 
                            [style.background-color]="status.color + '15'" 
                            [style.color]="status.color"
                            [style.border-color]="status.color + '40'">
                            {{ status.name }}
                          </span>
                        </td>

                        <!-- System Status Indicator -->
                        <td>
                          <span class="badge" [class.badge-system]="status.is_system" [class.badge-custom]="!status.is_system">
                            {{ status.is_system ? 'System' : 'Custom' }}
                          </span>
                        </td>

                        <!-- Row Actions -->
                        <td>
                          <div class="action-btns">
                            <button class="btn-edit" (click)="openEdit(status)">Edit</button>
                            @if (!status.is_system) {
                              <button class="btn-delete" (click)="confirmDelete(status)">Delete</button>
                            } @else {
                              <span class="locked-action" title="System status cannot be deleted">🔒 Locked</span>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                    @if (statuses().length === 0) {
                      <tr>
                        <td colspan="6" class="empty-cell">No order statuses found.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          }
        </main>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    @if (showForm()) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId() ? 'Edit Status' : 'Add Custom Status' }}</h2>
            <button class="modal-close" (click)="closeForm()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field field-full">
                <label>Status Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="form().name" 
                  class="form-input" 
                  placeholder="e.g. Quality Check" 
                  [disabled]="!!(editingId() && editingIsSystem())"/>
                @if (editingId() && editingIsSystem()) {
                  <span class="field-hint">The slug and name of system statuses are preserved. Only the color can be altered if needed, or localized label edits.</span>
                }
              </div>
              <div class="field field-full">
                <label>Status Theme Color</label>
                <div class="color-picker-zone">
                  <input 
                    type="color" 
                    [(ngModel)]="form().color" 
                    class="color-picker-input" />
                  <input 
                    type="text" 
                    [(ngModel)]="form().color" 
                    class="form-input color-text-input" 
                    placeholder="#B87333" />
                </div>
              </div>
              
              <div class="field field-full preview-field">
                <label>Preview Badge</label>
                <div class="preview-zone">
                  <span 
                    class="status-badge" 
                    [style.background-color]="form().color + '15'" 
                    [style.color]="form().color"
                    [style.border-color]="form().color + '40'">
                    {{ form().name || 'Status Name Preview' }}
                  </span>
                </div>
              </div>
            </div>
            @if (formError()) { <div class="error-msg" style="margin-top:1rem">{{ formError() }}</div> }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button class="btn-primary" (click)="saveStatus()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (editingId() ? 'Update Status' : 'Create Status') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 2rem; max-width: 100%; margin: 0 auto; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #1C1C1C; margin: 0 0 1.5rem 0; letter-spacing: -0.019em; }
    
    .settings-container { display: flex; gap: 2rem; align-items: flex-start; }
    
    .settings-tabs { width: 240px; display: flex; flex-direction: column; gap: 0.35rem; background: #fff; padding: 0.75rem; border: 1px solid #E8E8E8; border-radius: 8px; }
    .tab-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.7rem 1rem; background: none; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; color: #555; text-align: left; cursor: pointer; transition: all 0.15s ease; }
    .tab-btn:hover { background: #F7F8FA; color: #1C1C1C; }
    .tab-btn--active { background: rgba(184, 115, 51, 0.08); color: #B87333; font-weight: 600; }
    .tab-icon { color: inherit; opacity: 0.8; }
    
    .settings-content { flex: 1; min-width: 0; background: #fff; border: 1px solid #E8E8E8; border-radius: 8px; padding: 1.5rem; }
    .pane-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid #F0F0F0; padding-bottom: 1.25rem; }
    .pane-header h2 { font-size: 1.15rem; font-weight: 700; color: #1C1C1C; margin: 0 0 4px 0; }
    .pane-desc { font-size: 0.8rem; color: #666; margin: 0; }
    
    .loading { color: #888; padding: 2rem; text-align: center; }
    .error-msg { display: flex; align-items: center; justify-content: space-between; color: #DC2626; padding: 0.75rem 1rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    .error-msg button { background: none; border: 1px solid #DC2626; color: #DC2626; padding: 3px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all 0.15s ease; }
    .error-msg button:hover { background: #DC2626; color: #fff; }
    
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #666; background: #FAFAFA; border-bottom: 1px solid #E8E8E8; }
    .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #F0F0F0; color: #333; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #FCFCFD; }
    
    .reorder-btns { display: flex; gap: 4px; justify-content: center; }
    .btn-arrow { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; font-size: 0.7rem; background: #FFF; border: 1px solid #DDD; color: #555; border-radius: 4px; cursor: pointer; transition: all 0.1s ease; }
    .btn-arrow:hover:not(:disabled) { border-color: #B87333; color: #B87333; background: rgba(184, 115, 51, 0.03); }
    .btn-arrow:disabled { opacity: 0.35; cursor: not-allowed; }
    
    .status-title { font-weight: 600; color: #1C1C1C; }
    .font-mono { font-family: monospace; font-size: 0.8rem; }
    .muted { color: #888; }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid transparent; text-align: center; white-space: nowrap; }
    
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-system { background: #F0F0F0; color: #555; }
    .badge-custom { background: rgba(184, 115, 51, 0.08); color: #B87333; }
    
    .action-btns { display: flex; gap: 0.5rem; align-items: center; justify-content: flex-end; }
    .btn-edit { padding: 4px 10px; background: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.3); color: #B87333; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-weight: 500; transition: background 0.15s; }
    .btn-edit:hover { background: rgba(184,115,51,0.15); }
    .btn-delete { padding: 4px 10px; background: none; border: 1px solid rgba(220,38,38,0.3); color: #DC2626; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-weight: 500; transition: background 0.15s; }
    .btn-delete:hover { background: rgba(220,38,38,0.06); }
    .locked-action { font-size: 0.75rem; color: #999; padding: 4px 8px; background: #FAFAFA; border: 1px solid #EEE; border-radius: 4px; cursor: default; }
    
    .empty-cell { text-align: center; color: #AAAAAA; padding: 3rem; font-style: italic; }
    
    .btn-primary { padding: 0.5rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover { opacity: 0.95; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 0.5rem 1.25rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.875rem; cursor: pointer; transition: background 0.15s; }
    .btn-secondary:hover { background: #F7F8FA; }
    
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); overflow: hidden; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #E8E8E8; }
    .modal-header h2 { font-size: 1rem; font-weight: 700; color: #1C1C1C; margin: 0; }
    .modal-close { background: none; border: none; color: #888; font-size: 1.15rem; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .modal-close:hover { color: #1C1C1C; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #E8E8E8; background: #FAFAFA; }
    
    .form-grid { display: flex; flex-direction: column; gap: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #666; }
    .field-hint { font-size: 0.75rem; color: #888; margin-top: 4px; line-height: 1.3; }
    .form-input { padding: 0.55rem 0.75rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 6px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; transition: all 0.15s; }
    .form-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-input::placeholder { color: #AAAAAA; }
    .form-input:disabled { background: #F5F5F5; color: #777; cursor: not-allowed; }
    
    .color-picker-zone { display: flex; gap: 0.5rem; align-items: center; }
    .color-picker-input { width: 42px; height: 42px; padding: 0; border: 1px solid #E8E8E8; border-radius: 6px; cursor: pointer; background: none; flex-shrink: 0; }
    .color-text-input { text-transform: uppercase; }
    
    .preview-field { border-top: 1px dashed #E8E8E8; padding-top: 1rem; margin-top: 0.5rem; }
    .preview-zone { display: flex; justify-content: center; align-items: center; padding: 1.5rem; background: #F9FAFB; border: 1px solid #E8E8E8; border-radius: 8px; }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private readonly api = inject(ApiService);

  activeTab = signal<'statuses'>('statuses');
  statuses = signal<OrderStatus[]>([]);
  loading = signal(true);
  error = signal('');

  showForm = signal(false);
  editingId = signal<number | null>(null);
  editingIsSystem = signal(false);
  saving = signal(false);
  formError = signal('');
  form = signal(EMPTY_FORM());

  ngOnInit(): void {
    this.loadStatuses();
  }

  loadStatuses(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.get<any>('/admin/order-statuses').subscribe({
      next: (res) => {
        this.statuses.set(res.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.userMessage || 'Failed to load order statuses');
        this.loading.set(false);
      }
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.editingIsSystem.set(false);
    this.form.set(EMPTY_FORM());
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(status: OrderStatus): void {
    this.editingId.set(status.id);
    this.editingIsSystem.set(status.is_system);
    this.form.set({
      name: status.name,
      color: status.color
    });
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  saveStatus(): void {
    const f = this.form();
    if (!f.name.trim()) {
      this.formError.set('Status name is required');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const payload = {
      name: f.name.trim(),
      color: f.color || '#B87333'
    };

    const editId = this.editingId();
    const req = editId
      ? this.api.put<any>(`/admin/order-statuses/${editId}`, payload)
      : this.api.post<any>('/admin/order-statuses', payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.loadStatuses();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err.userMessage || 'Failed to save status');
      }
    });
  }

  confirmDelete(status: OrderStatus): void {
    if (status.is_system) return;
    if (!confirm(`Are you sure you want to delete the custom status "${status.name}"?`)) return;

    this.api.delete<any>(`/admin/order-statuses/${status.id}`).subscribe({
      next: () => {
        this.loadStatuses();
      },
      error: (err) => {
        alert(err.userMessage || 'Delete failed');
      }
    });
  }

  moveStatus(index: number, direction: number): void {
    const list = [...this.statuses()];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap elements in the local list
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Instantly update UI for snappy feeling
    this.statuses.set(list);

    // Call API to persist new ordering
    const ids = list.map(s => s.id);
    this.api.put<any>('/admin/order-statuses/reorder', { ids }).subscribe({
      error: (err) => {
        console.error('Failed to save status order', err);
        // Rollback on error
        this.loadStatuses();
      }
    });
  }
}
