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
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss'],
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
