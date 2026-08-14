import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminConfirmService } from '../shared/admin-confirm.service';
import { AdminToastService } from '../shared/admin-toast.service';

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
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly confirmSvc = inject(AdminConfirmService);
  private readonly toast = inject(AdminToastService);

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

  draggedIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

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
        this.toast.success(editId ? 'Status updated' : 'Status created');
        this.loadStatuses();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err.userMessage || 'Failed to save status');
      }
    });
  }

  async confirmDelete(status: OrderStatus): Promise<void> {
    if (status.is_system) return;
    const ok = await this.confirmSvc.confirm({
      title: 'Delete Status',
      message: `Are you sure you want to delete the custom status "${status.name}"?`,
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;

    this.api.delete<any>(`/admin/order-statuses/${status.id}`).subscribe({
      next: () => {
        this.toast.success('Status deleted');
        this.loadStatuses();
      },
      error: (err) => {
        this.toast.error(err.userMessage || 'Delete failed');
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

    this.applyNewOrder(list);
  }

  private applyNewOrder(list: OrderStatus[]): void {
    // Instantly update UI for snappy feeling
    this.statuses.set(list);

    // Call API to persist new ordering
    const ids = list.map(s => s.id);
    this.api.put<any>('/admin/order-statuses/reorder', { ids }).subscribe({
      error: (err) => {
        this.toast.error(err.userMessage || 'Failed to save new order');
        this.loadStatuses();
      }
    });
  }

  onDragStart(index: number): void {
    this.draggedIndex.set(index);
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.draggedIndex() === null || this.draggedIndex() === index) return;
    this.dragOverIndex.set(index);
  }

  onDragLeave(index: number): void {
    if (this.dragOverIndex() === index) this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    const fromIndex = this.draggedIndex();
    this.dragOverIndex.set(null);
    if (fromIndex === null || fromIndex === dropIndex) return;

    const list = [...this.statuses()];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(dropIndex, 0, moved);

    this.applyNewOrder(list);
  }

  onDragEnd(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }
}
