import { Directive, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminToastService } from './admin-toast.service';

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
const DEVICE_W: Record<PreviewDevice, number> = { mobile: 375, tablet: 768, desktop: 1280 };
const PANEL_W = 344; // usable px inside the preview panel

/** Shared CRUD logic for the hair-wig and hair-patch admin edit screens —
 * both are thin views over the same `hair_solutions` table (see
 * hair-solution-admin.service.ts), differing only in `type`, routes, and a
 * handful of labels. Templates stay separate per subclass — the live
 * preview panel's marketing copy genuinely differs per product type — only
 * this logic layer was actually duplicated (LK-L17). */
@Directive()
export abstract class HairSolutionEditBase implements OnInit {
  protected readonly api = inject(ApiService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly toast = inject(AdminToastService);
  readonly imgUrl = imageUrl;

  protected abstract readonly solutionType: 'wig' | 'patch';
  protected abstract readonly listRoute: string;
  protected abstract readonly publicPath: string;
  protected abstract readonly typeLabel: string;
  protected abstract emptyForm(): Record<string, any>;

  isNew = signal(false);
  itemId = signal<number>(0);
  loading = signal(true);
  error = signal('');
  saving = signal(false);
  formError = signal('');
  // Typed `any` (not Record<string, any>) so the templates — which use
  // dot-notation like `form().name` throughout — don't trip
  // noPropertyAccessFromIndexSignature.
  form = signal<any>(this.emptyForm());
  imgPreview = signal('');
  imgUploading = signal(false);
  previewDevice = signal<PreviewDevice>('mobile');

  readonly previewFrameWidth = computed(() => DEVICE_W[this.previewDevice()]);
  readonly previewScale = computed(() => PANEL_W / this.previewFrameWidth());
  readonly scalePercent = computed(() => Math.round(this.previewScale() * 100));

  readonly paymentLabel = computed(() => {
    const map: Record<string, string> = {
      full_cod: 'Pay on Delivery', full_online: 'Online Payment Only',
      partial: `Advance ₹${this.form().advance_amount || '—'} + Balance on Delivery`,
      hybrid: 'COD / Online — Your Choice'
    };
    return map[this.form().payment_mode] || 'Pay on Delivery';
  });

  ngOnInit(): void {
    const mode = this.route.snapshot.data['mode'];
    this.isNew.set(mode === 'create');
    if (this.isNew()) {
      this.loading.set(false);
    } else {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.itemId.set(id);
      this.loadItem(id);
    }
  }

  private loadItem(id: number): void {
    this.loading.set(true);
    this.api.get<any>(`/admin/hair-solutions/${id}`).subscribe({
      next: (res: any) => {
        const d = res.data;
        this.form.set({
          name: d.name || '', short_description: d.short_description || '',
          description: d.description || '', base_price: String(d.base_price || ''),
          mrp: String(d.mrp || ''), gender: d.gender || '', size_info: d.size_info || '',
          colour_info: d.colour_info || '', how_to_use: d.how_to_use || '',
          primary_image: d.primary_image || null, status: d.status || 'active',
          payment_mode: d.payment_mode || 'full_cod',
          advance_amount: d.advance_amount != null ? String(d.advance_amount) : ''
        });
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.userMessage || 'Failed to load'); this.loading.set(false); }
    });
  }

  goBack(): void { this.router.navigate([this.listRoute]); }

  previewLive(): void { window.open(this.publicPath, '_blank'); }

  getDiscount(): number {
    const p = +this.form().base_price, m = +this.form().mrp;
    return (!p || !m || m <= p) ? 0 : Math.round(((m - p) / m) * 100);
  }

  onImagePick(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.itemId()) return;
    const reader = new FileReader();
    reader.onload = (e) => this.imgPreview.set(e.target!.result as string);
    reader.readAsDataURL(file);
    this.imgUploading.set(true);
    const fd = new FormData();
    fd.append('image', file);
    this.api.uploadFormData<any>(`/admin/hair-solutions/${this.itemId()}/upload-image`, fd).subscribe({
      next: (res: any) => {
        this.imgUploading.set(false);
        this.form.update((f: any) => ({ ...f, primary_image: res.data?.primary_image }));
      },
      error: () => { this.imgUploading.set(false); this.toast.error('Image upload failed'); }
    });
  }

  save(): void {
    const f = this.form();
    if (!f.name?.trim()) { this.formError.set('Name is required'); return; }
    if (!f.base_price) { this.formError.set('Price is required'); return; }
    this.saving.set(true);
    this.formError.set('');
    const payload = {
      ...f, type: this.solutionType,
      base_price: Number(f.base_price),
      mrp: f.mrp ? Number(f.mrp) : null,
      advance_amount: f.payment_mode === 'partial' ? (Number(f.advance_amount) || null) : null
    };
    const req = this.isNew()
      ? this.api.post<any>('/admin/hair-solutions', payload)
      : this.api.put<any>(`/admin/hair-solutions/${this.itemId()}`, payload);
    req.subscribe({
      next: (res: any) => {
        this.saving.set(false);
        this.toast.success(this.isNew() ? `${this.typeLabel} created` : `${this.typeLabel} updated`);
        if (this.isNew()) {
          const newId = res.data?.id;
          newId
            ? this.router.navigate([this.listRoute, newId, 'edit'])
            : this.router.navigate([this.listRoute]);
        } else {
          this.router.navigate([this.listRoute]);
        }
      },
      error: (err: any) => { this.saving.set(false); this.formError.set(err.userMessage || 'Save failed'); }
    });
  }
}
