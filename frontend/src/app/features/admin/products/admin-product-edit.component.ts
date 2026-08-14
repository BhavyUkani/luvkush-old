import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminToastService } from '../shared/admin-toast.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

interface Category { id: number; name: string; slug: string; }

const EXCLUDED_CATEGORY_SLUGS = ['hair-wigs', 'hair-patches'];

const EMPTY_FORM = () => ({
  name: '', subtitle: '', category_id: '',
  price: '', mrp: '', cost_price: '', stock_quantity: '',
  short_description: '', description: '',
  benefits: '', how_to_use: '',
  ingredients_list: '', badges: '', tags: '',
  seo_title: '', seo_description: '', seo_keywords: '',
  weight: '', length_cm: '', width_cm: '', height_cm: '',
  payment_mode: 'full_cod', advance_amount: '',
  status: 'active',
  is_featured: false, is_bestseller: false, is_new: false
});

interface ImgSlot { id: number; existingUrl: string | null; file: File | null; preview: string; }
const emptySlots = (): ImgSlot[] => Array.from({ length: 5 }, (_, i) => ({ id: i, existingUrl: null, file: null, preview: '' }));

type Device = 'mobile' | 'tablet' | 'desktop';
const DEVICE_W: Record<Device, number> = { mobile: 375, tablet: 768, desktop: 1280 };
const PANEL_W = 344; // usable px inside the preview panel

@Component({
  selector: 'lk-admin-product-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IndianCurrencyPipe],
  templateUrl: './admin-product-edit.component.html',
  styleUrls: ['./admin-product-edit.component.scss'],
})
export class AdminProductEditComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(AdminToastService);
  readonly imgUrl = imageUrl;

  isNew = signal(false);
  productId = signal<number>(0);
  productSlug = signal<string>('');
  loading = signal(true);
  error = signal('');
  saving = signal(false);
  formError = signal('');
  form = signal(EMPTY_FORM());
  imgSlots = signal<ImgSlot[]>(emptySlots());
  categories = signal<Category[]>([]);
  previewDevice = signal<Device>('mobile');

  readonly filteredCategories = computed(() =>
    this.categories().filter(c => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug))
  );

  readonly firstPreview = computed(() =>
    this.imgSlots().find(s => s.preview)?.preview ?? ''
  );

  readonly badgeList = computed(() =>
    this.form().badges.split(',').map(b => b.trim()).filter(Boolean)
  );

  readonly selectedCategoryName = computed(() =>
    this.categories().find(c => String(c.id) === String(this.form().category_id))?.name ?? ''
  );

  readonly previewFrameWidth = computed(() => DEVICE_W[this.previewDevice()]);

  readonly previewScale = computed(() => PANEL_W / this.previewFrameWidth());

  readonly scalePercent = computed(() => Math.round(this.previewScale() * 100));

  readonly paymentLabel = computed(() => {
    const map: Record<string, string> = {
      full_cod: 'Pay on Delivery',
      full_online: 'Online Payment Only',
      partial: `Advance ₹${this.form().advance_amount || '—'} + Balance on Delivery`,
      hybrid: 'COD / Online — Your Choice'
    };
    return map[this.form().payment_mode] || 'Pay on Delivery';
  });

  ngOnInit(): void {
    const mode = this.route.snapshot.data['mode'];
    this.isNew.set(mode === 'create');
    this.loadCategories();
    if (this.isNew()) {
      this.loading.set(false);
    } else {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.error.set('');
    this.api.get<any>(`/admin/products/${id}`).subscribe({
      next: (res: any) => {
        const p = res.data;
        this.productSlug.set(p.slug || '');
        this.form.set({
          name: p.name,
          subtitle: p.subtitle || '',
          category_id: String(p.category_id || ''),
          price: String(p.price),
          mrp: String(p.mrp || ''),
          cost_price: String(p.cost_price || ''),
          stock_quantity: String(p.stock_quantity),
          short_description: p.short_description || '',
          description: p.description || '',
          benefits: p.benefits || '',
          how_to_use: p.how_to_use || '',
          ingredients_list: p.ingredients_list || '',
          badges: p.badges || '',
          tags: p.tags || '',
          seo_title: p.seo_title || '',
          seo_description: p.seo_description || '',
          seo_keywords: p.seo_keywords || '',
          weight: String(p.weight || ''),
          length_cm: String(p.length_cm || ''),
          width_cm: String(p.width_cm || ''),
          height_cm: String(p.height_cm || ''),
          payment_mode: p.payment_mode || 'full_cod',
          advance_amount: String(p.advance_amount || ''),
          status: p.status,
          is_featured: p.is_featured,
          is_bestseller: p.is_bestseller,
          is_new: p.is_new
        });
        const allUrls: string[] = [];
        if (p.primary_image) allUrls.push(p.primary_image);
        try {
          const parsed: string[] = JSON.parse(p.images || '[]');
          parsed.forEach((u: string) => { if (u && !allUrls.includes(u)) allUrls.push(u); });
        } catch { /* ignore */ }
        this.imgSlots.set(Array.from({ length: 5 }, (_, i) => ({
          id: i,
          existingUrl: allUrls[i] ?? null,
          file: null,
          preview: allUrls[i] ? imageUrl(allUrls[i]) : ''
        })));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.userMessage || 'Failed to load product');
        this.loading.set(false);
      }
    });
  }

  private loadCategories(): void {
    this.api.get<any>('/admin/categories').subscribe({
      next: (res) => this.categories.set(res.data || [])
    });
  }

  goBack(): void {
    this.revokeSlotUrls();
    this.router.navigate(['/admin/products']);
  }

  previewLive(): void {
    const slug = this.productSlug();
    window.open(slug ? `/products/${slug}` : '/products', '_blank');
  }

  onSlotFile(slotIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const s = this.imgSlots()[slotIndex];
    if (s.file) URL.revokeObjectURL(s.preview);
    const preview = URL.createObjectURL(file);
    this.imgSlots.update(slots => slots.map((sl, i) => i === slotIndex ? { ...sl, file, preview } : sl));
    input.value = '';
  }

  removeSlot(slotIndex: number): void {
    this.imgSlots.update(slots => {
      const updated = [...slots];
      const s = updated[slotIndex];
      if (s.file) URL.revokeObjectURL(s.preview);
      updated[slotIndex] = { id: s.id, existingUrl: null, file: null, preview: '' };
      return updated;
    });
  }

  setSlotPrimary(slotIndex: number): void {
    this.imgSlots.update(slots => {
      const updated = [...slots];
      const [chosen] = updated.splice(slotIndex, 1);
      return [chosen, ...updated];
    });
  }

  private revokeSlotUrls(): void {
    this.imgSlots().forEach(s => { if (s.file) URL.revokeObjectURL(s.preview); });
  }

  getDiscount(): number {
    const p = +this.form().price, m = +this.form().mrp;
    if (!p || !m || m <= p) return 0;
    return Math.round(((m - p) / m) * 100);
  }

  getMargin(): number {
    const p = +this.form().price, c = +this.form().cost_price;
    if (!p || !c || c >= p) return 0;
    return Math.round(((p - c) / p) * 100);
  }

  saveProduct(): void {
    const f = this.form();
    if (!f.name.trim()) { this.formError.set('Product name is required'); return; }
    if (!f.category_id) { this.formError.set('Category is required'); return; }
    if (!f.price) { this.formError.set('Selling price is required'); return; }

    this.saving.set(true);
    this.formError.set('');

    const slots = this.imgSlots();
    const keptUrls = slots.filter(s => s.existingUrl && !s.file).map(s => s.existingUrl as string);
    const newFiles = slots.filter(s => s.file).map(s => s.file as File);

    const fd = new FormData();
    fd.append('name', f.name.trim());
    fd.append('subtitle', f.subtitle || '');
    fd.append('category_id', String(Number(f.category_id)));
    fd.append('price', String(Number(f.price)));
    fd.append('mrp', String(Number(f.mrp) || Number(f.price)));
    fd.append('cost_price', f.cost_price ? String(Number(f.cost_price)) : '');
    fd.append('stock_quantity', String(Number(f.stock_quantity) || 0));
    fd.append('short_description', f.short_description || '');
    fd.append('description', f.description || '');
    fd.append('benefits', f.benefits || '');
    fd.append('how_to_use', f.how_to_use || '');
    fd.append('ingredients_list', f.ingredients_list || '');
    fd.append('badges', f.badges || '');
    fd.append('tags', f.tags || '');
    fd.append('seo_title', f.seo_title || '');
    fd.append('seo_description', f.seo_description || '');
    fd.append('seo_keywords', f.seo_keywords || '');
    fd.append('weight', f.weight ? String(Number(f.weight)) : '');
    fd.append('length_cm', f.length_cm ? String(Number(f.length_cm)) : '');
    fd.append('width_cm', f.width_cm ? String(Number(f.width_cm)) : '');
    fd.append('height_cm', f.height_cm ? String(Number(f.height_cm)) : '');
    fd.append('payment_mode', f.payment_mode || 'full_cod');
    fd.append('advance_amount', f.advance_amount ? String(Number(f.advance_amount)) : '');
    fd.append('status', f.status);
    fd.append('is_featured', String(f.is_featured ? 1 : 0));
    fd.append('is_bestseller', String(f.is_bestseller ? 1 : 0));
    fd.append('is_new', String(f.is_new ? 1 : 0));
    fd.append('existing_images', JSON.stringify(keptUrls));
    newFiles.forEach(file => fd.append('images', file));

    const req = this.isNew()
      ? this.api.uploadFormData<any>('/admin/products', fd, 'post')
      : this.api.uploadFormData<any>(`/admin/products/${this.productId()}`, fd, 'put');
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.revokeSlotUrls();
        this.toast.success(this.isNew() ? 'Product created' : 'Product updated');
        this.router.navigate(['/admin/products']);
      },
      error: (err) => { this.saving.set(false); this.formError.set(err.userMessage || 'Save failed'); }
    });
  }
}
