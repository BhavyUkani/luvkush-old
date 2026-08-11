import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminToastService } from '../shared/admin-toast.service';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="edit-page">

      <!-- Sticky Top Bar -->
      <div class="top-bar">
        <button class="btn-back" (click)="goBack()">← Products</button>
        <div class="top-title">
          <span>{{ isNew() ? 'Add Product' : (!loading() && !error() ? (form().name || 'Edit Product') : 'Edit Product') }}</span>
        </div>
        <div class="top-actions">
          <button class="btn-secondary" (click)="goBack()">Discard</button>
          <button class="btn-primary" (click)="saveProduct()" [disabled]="saving() || loading()">
            {{ saving() ? 'Saving…' : (isNew() ? 'Create Product' : 'Save Changes') }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="center-state">Loading product…</div>
      } @else if (error()) {
        <div class="center-state error-text">
          <p>{{ error() }}</p>
          <button class="btn-secondary" (click)="goBack()">← Go Back</button>
        </div>
      } @else {

        <div class="layout">

          <!-- ════ LEFT: Form Cards ════ -->
          <div class="cards-col">

            @if (formError()) {
              <div class="error-banner">{{ formError() }}</div>
            }

            <!-- General -->
            <div class="card">
              <div class="card-heading">General</div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>Product Name *</label>
                  <input type="text" [(ngModel)]="form().name" class="form-input" placeholder="e.g. Kesar Panchamrit Soap" />
                </div>
                <div class="field field-full">
                  <label>Subtitle / Tagline</label>
                  <input type="text" [(ngModel)]="form().subtitle" class="form-input" placeholder="Natural Radiant Glow | Rejuvenating & Moisturizing" />
                </div>
                <div class="field">
                  <label>Category *</label>
                  <select [(ngModel)]="form().category_id" class="form-input">
                    <option value="">Select category…</option>
                    @for (cat of filteredCategories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label>Status</label>
                  <select [(ngModel)]="form().status" class="form-input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div class="field field-full checkboxes">
                  <label><input type="checkbox" [(ngModel)]="form().is_featured" /> Featured on Homepage</label>
                  <label><input type="checkbox" [(ngModel)]="form().is_bestseller" /> Bestseller Badge</label>
                  <label><input type="checkbox" [(ngModel)]="form().is_new" /> New Arrival</label>
                </div>
              </div>
            </div>

            <!-- Images -->
            <div class="card">
              <div class="card-heading">Images <span class="card-hint">first = primary · max 5</span></div>
              <div class="img-slots">
                @for (slot of imgSlots(); track slot.id; let i = $index) {
                  <div class="img-slot" [class.slot-primary]="i === 0">
                    @if (slot.preview) {
                      <img [src]="slot.preview" class="slot-img" alt="Image {{ i + 1 }}" />
                      <div class="slot-actions">
                        <button type="button" class="slot-btn slot-remove" (click)="removeSlot(i)" title="Remove">×</button>
                        @if (i > 0) {
                          <button type="button" class="slot-btn slot-star" (click)="setSlotPrimary(i)" title="Set primary">★</button>
                        }
                      </div>
                      @if (i === 0) { <span class="primary-tag">Primary</span> }
                    } @else {
                      <label class="slot-empty" [for]="'img-' + i">
                        <span class="slot-plus">+</span>
                        <span class="slot-lbl">{{ i === 0 ? 'Primary' : 'Image ' + (i + 1) }}</span>
                      </label>
                    }
                    <input [id]="'img-' + i" type="file" accept="image/jpeg,image/png,image/webp" hidden (change)="onSlotFile(i, $event)" />
                  </div>
                }
              </div>
              <p class="hint">JPEG, PNG or WebP — auto-converted to WebP 800×1000 px. Click ★ to set primary.</p>
            </div>

            <!-- Description -->
            <div class="card">
              <div class="card-heading">Description</div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>Short Description</label>
                  <textarea [(ngModel)]="form().short_description" class="form-textarea" rows="2" placeholder="One or two lines shown in product listings…"></textarea>
                </div>
                <div class="field field-full">
                  <label>Full Description</label>
                  <textarea [(ngModel)]="form().description" class="form-textarea" rows="5" placeholder="Full product description — story, details, heritage…"></textarea>
                </div>
                <div class="field field-full">
                  <label>Benefits</label>
                  <textarea [(ngModel)]="form().benefits" class="form-textarea" rows="4" placeholder="• Promotes hair growth&#10;• Reduces dandruff&#10;• Strengthens roots"></textarea>
                  <span class="hint">One benefit per line.</span>
                </div>
                <div class="field field-full">
                  <label>How To Use</label>
                  <textarea [(ngModel)]="form().how_to_use" class="form-textarea" rows="4" placeholder="Step 1: Apply to scalp&#10;Step 2: Massage for 5 minutes"></textarea>
                </div>
                <div class="field field-full">
                  <label>Key Ingredients</label>
                  <textarea [(ngModel)]="form().ingredients_list" class="form-textarea" rows="4" placeholder="Kesar (Saffron): Brightens skin tone&#10;Sandalwood: Soothes and cools"></textarea>
                  <span class="hint">One ingredient per line — Name: Benefit format.</span>
                </div>
                <div class="field field-full">
                  <label>Badges / Labels</label>
                  <input type="text" [(ngModel)]="form().badges" class="form-input" placeholder="Herbal, Natural, Handcrafted, Cruelty-Free" />
                  <span class="hint">Comma-separated.</span>
                </div>
                <div class="field field-full">
                  <label>Search Tags</label>
                  <input type="text" [(ngModel)]="form().tags" class="form-input" placeholder="soap, kesar, saffron, herbal, skin glow" />
                  <span class="hint">Comma-separated.</span>
                </div>
              </div>
            </div>

            <!-- Inventory -->
            <div class="card">
              <div class="card-heading">Inventory &amp; Pricing</div>
              <div class="form-grid">
                <div class="field">
                  <label>Selling Price (₹) *</label>
                  <input type="number" [(ngModel)]="form().price" class="form-input" placeholder="399" />
                </div>
                <div class="field">
                  <label>MRP (₹)</label>
                  <input type="number" [(ngModel)]="form().mrp" class="form-input" placeholder="499" />
                </div>
                <div class="field">
                  <label>Cost Price (₹)</label>
                  <input type="number" [(ngModel)]="form().cost_price" class="form-input" placeholder="150" />
                </div>
                <div class="field">
                  <label>Stock Quantity</label>
                  <input type="number" [(ngModel)]="form().stock_quantity" class="form-input" placeholder="100" />
                </div>
                @if (form().price && form().mrp && +form().mrp > +form().price) {
                  <div class="field-full">
                    <div class="calc-row">
                      <span class="calc-chip">Discount <strong>{{ getDiscount() }}%</strong></span>
                      @if (form().cost_price) {
                        <span class="calc-chip">Margin <strong>{{ getMargin() }}%</strong></span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Physical -->
            <div class="card">
              <div class="card-heading">Physical <span class="card-hint">for Shiprocket shipping</span></div>
              <div class="form-grid">
                <div class="field">
                  <label>Weight (g)</label>
                  <input type="number" [(ngModel)]="form().weight" class="form-input" placeholder="100" />
                </div>
                <div class="field">
                  <label>Length (cm)</label>
                  <input type="number" [(ngModel)]="form().length_cm" class="form-input" placeholder="8" step="0.1" />
                </div>
                <div class="field">
                  <label>Width (cm)</label>
                  <input type="number" [(ngModel)]="form().width_cm" class="form-input" placeholder="6" step="0.1" />
                </div>
                <div class="field">
                  <label>Height (cm)</label>
                  <input type="number" [(ngModel)]="form().height_cm" class="form-input" placeholder="3" step="0.1" />
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="card">
              <div class="card-heading">Payment</div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>Payment Mode</label>
                  <select [(ngModel)]="form().payment_mode" class="form-input">
                    <option value="full_cod">Complete COD — Pay on delivery</option>
                    <option value="full_online">Complete Online — No COD</option>
                    <option value="partial">Partial — Advance + rest on delivery</option>
                    <option value="hybrid">Hybrid — Customer chooses COD / Online</option>
                  </select>
                </div>
                @if (form().payment_mode === 'partial') {
                  <div class="field">
                    <label>Advance Amount (₹)</label>
                    <input type="number" [(ngModel)]="form().advance_amount" class="form-input" placeholder="500" />
                    <span class="hint">Paid online upfront; balance on delivery.</span>
                  </div>
                }
              </div>
              <div class="payment-guide">
                <div class="pg-item"><strong>full_cod</strong> Standard products, local delivery</div>
                <div class="pg-item"><strong>full_online</strong> High-value / pre-order</div>
                <div class="pg-item"><strong>partial</strong> Hair wigs, patches, custom orders</div>
                <div class="pg-item"><strong>hybrid</strong> Both COD and online acceptable</div>
              </div>
            </div>

            <!-- SEO -->
            <div class="card">
              <div class="card-heading">SEO</div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>SEO Title</label>
                  <input type="text" [(ngModel)]="form().seo_title" class="form-input" placeholder="Kesar Panchamrit Soap — Natural Glow | Luv Kush Natural" />
                  <span class="hint char-hint" [class.over]="form().seo_title.length > 60">{{ form().seo_title.length }}/60</span>
                </div>
                <div class="field field-full">
                  <label>Meta Description</label>
                  <textarea [(ngModel)]="form().seo_description" class="form-textarea" rows="3" placeholder="Buy natural Kesar Panchamrit Soap online…"></textarea>
                  <span class="hint char-hint" [class.over]="form().seo_description.length > 160">{{ form().seo_description.length }}/160</span>
                </div>
                <div class="field field-full">
                  <label>Meta Keywords</label>
                  <input type="text" [(ngModel)]="form().seo_keywords" class="form-input" placeholder="kesar soap, saffron soap, herbal soap india" />
                  <span class="hint">Comma-separated. 5–10 specific phrases.</span>
                </div>
              </div>
            </div>

            <div class="bottom-bar">
              <button class="btn-secondary" (click)="goBack()">Discard</button>
              <button class="btn-primary" (click)="saveProduct()" [disabled]="saving()">
                {{ saving() ? 'Saving…' : (isNew() ? 'Create Product' : 'Save Changes') }}
              </button>
            </div>

          </div><!-- /cards-col -->

          <!-- ════ RIGHT: Live Preview ════ -->
          <div class="preview-col">
            <div class="preview-panel">

              <!-- Panel header -->
              <div class="pv-header">
                <span class="pv-title">Live Preview</span>
                <div class="device-btns">
                  <button class="dev-btn" [class.dev-active]="previewDevice() === 'mobile'"
                          (click)="previewDevice.set('mobile')" title="Mobile (375px)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                    Mobile
                  </button>
                  <button class="dev-btn" [class.dev-active]="previewDevice() === 'tablet'"
                          (click)="previewDevice.set('tablet')" title="Tablet (768px)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="19" y1="12" x2="19" y2="12"/></svg>
                    Tablet
                  </button>
                  <button class="dev-btn" [class.dev-active]="previewDevice() === 'desktop'"
                          (click)="previewDevice.set('desktop')" title="Desktop (1280px)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
                    Desktop
                  </button>
                </div>
              </div>

              <!-- Size label -->
              <div class="pv-size-label">{{ previewDevice() === 'mobile' ? '375px' : previewDevice() === 'tablet' ? '768px' : '1280px' }} · {{ scalePercent() }}% zoom</div>

              <!-- Browser chrome -->
              <div class="browser-chrome">
                <div class="chrome-dots"><span></span><span></span><span></span></div>
                <div class="chrome-url">luvkushnatural.com/products/{{ productSlug() || '...' }}</div>
              </div>

              <!-- Scaled product page -->
              <div class="pv-outer">
                <div class="pv-scaler"
                     [style.width.px]="previewFrameWidth()"
                     [style.transform]="'scale(' + previewScale() + ')'">

                  <!-- ── Simulated Product Page ── -->
                  <div class="pp" [class.pp-mobile]="previewDevice() === 'mobile'"
                                  [class.pp-tablet]="previewDevice() === 'tablet'"
                                  [class.pp-desktop]="previewDevice() === 'desktop'">

                    <!-- Announcement bar -->
                    <div class="pp-announce">Free shipping on orders above ₹499 &nbsp;·&nbsp; 100% Natural</div>

                    <!-- Header -->
                    <div class="pp-head">
                      <div class="pp-logo">Luv Kush Natural</div>
                      <div class="pp-nav-links">
                        <span>Home</span><span>Shop</span><span>About</span><span>Contact</span>
                      </div>
                      <div class="pp-head-icons">
                        <span class="pp-icon">🔍</span>
                        <span class="pp-icon">🛒</span>
                      </div>
                    </div>

                    <!-- Breadcrumb -->
                    <div class="pp-breadcrumb">
                      Home &rsaquo; Products &rsaquo; <strong>{{ form().name || '...' }}</strong>
                    </div>

                    <!-- Product Hero -->
                    <div class="pp-hero">

                      <!-- Image Gallery -->
                      <div class="pp-gallery">
                        <div class="pp-main-wrap">
                          @if (firstPreview()) {
                            <img [src]="firstPreview()" class="pp-main-img" />
                          } @else {
                            <div class="pp-no-img">
                              <span>No Image</span>
                            </div>
                          }
                          @if (form().is_new) { <span class="pp-sticker pp-new">New</span> }
                          @if (form().is_bestseller) { <span class="pp-sticker pp-best">Bestseller</span> }
                        </div>
                        <!-- Thumbnail row -->
                        <div class="pp-thumbs">
                          @for (slot of imgSlots(); track slot.id) {
                            @if (slot.preview) {
                              <div class="pp-thumb" [class.pp-thumb-sel]="slot.id === 0">
                                <img [src]="slot.preview" />
                              </div>
                            }
                          }
                        </div>
                      </div>

                      <!-- Product Info -->
                      <div class="pp-info">

                        <!-- Badges row -->
                        @if (badgeList().length) {
                          <div class="pp-badge-row">
                            @for (b of badgeList().slice(0, 4); track b) {
                              <span class="pp-badge">{{ b }}</span>
                            }
                          </div>
                        }

                        <h1 class="pp-name">{{ form().name || 'Product Name' }}</h1>

                        @if (form().subtitle) {
                          <p class="pp-sub">{{ form().subtitle }}</p>
                        }

                        <!-- Stars -->
                        <div class="pp-stars">
                          <span class="pp-star-icons">★★★★★</span>
                          <span class="pp-review-ct">24 reviews</span>
                        </div>

                        <!-- Price row -->
                        <div class="pp-price-row">
                          @if (form().price) {
                            <span class="pp-price">₹{{ form().price }}</span>
                          } @else {
                            <span class="pp-price pp-price-empty">₹ —</span>
                          }
                          @if (form().mrp && +form().mrp > +form().price) {
                            <span class="pp-mrp">₹{{ form().mrp }}</span>
                            <span class="pp-off">{{ getDiscount() }}% OFF</span>
                          }
                        </div>

                        <!-- Short description -->
                        @if (form().short_description) {
                          <p class="pp-short">{{ form().short_description }}</p>
                        }

                        <!-- Stock -->
                        <div class="pp-stock-row">
                          @if (+form().stock_quantity === 0) {
                            <span class="pp-out">✕ Out of Stock</span>
                          } @else if (+form().stock_quantity > 0 && +form().stock_quantity <= 5) {
                            <span class="pp-low">⚡ Only {{ form().stock_quantity }} left!</span>
                          } @else if (+form().stock_quantity > 5) {
                            <span class="pp-instock">✓ In Stock</span>
                          }
                        </div>

                        <!-- Qty + Cart -->
                        <div class="pp-cart-row">
                          <div class="pp-qty"><button>−</button><span>1</span><button>+</button></div>
                          <button class="pp-add-btn">Add to Cart</button>
                        </div>
                        <button class="pp-buy-btn">Buy Now</button>

                        <!-- Payment badge -->
                        <div class="pp-pay-badge">
                          <span class="pp-pay-icon">💳</span>
                          <span>{{ paymentLabel() }}</span>
                        </div>

                        <!-- Feature pills -->
                        <div class="pp-pills">
                          <span class="pp-pill">🌿 Natural</span>
                          <span class="pp-pill">✓ Herbal</span>
                          <span class="pp-pill">🚚 Fast Delivery</span>
                        </div>

                      </div><!-- /pp-info -->
                    </div><!-- /pp-hero -->

                    <!-- Description tabs -->
                    <div class="pp-tabs-section">
                      <div class="pp-tabs-bar">
                        <span class="pp-tab pp-tab-sel">Description</span>
                        <span class="pp-tab">Benefits</span>
                        <span class="pp-tab">How To Use</span>
                        <span class="pp-tab">Ingredients</span>
                      </div>
                      <div class="pp-tab-content">
                        {{ (form().description || 'Product description will appear here after you fill in the Full Description field above.') | slice:0:280 }}{{ form().description && form().description.length > 280 ? '…' : '' }}
                      </div>
                    </div>

                  </div><!-- /pp -->
                </div><!-- /pv-scaler -->
              </div><!-- /pv-outer -->

              <!-- Open on store -->
              <button class="btn-open-store" (click)="previewLive()">Preview on Store ↗</button>

            </div><!-- /preview-panel -->
          </div><!-- /preview-col -->

        </div><!-- /layout -->
      }
    </div>
  `,
  styles: [`
    /* ─── Page shell ─── */
    .edit-page { min-height: 100vh; background: #F7F8FA; }

    .top-bar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; gap: 1rem; padding: 0.7rem 2rem; background: #fff; border-bottom: 1px solid #E8E8E8; }
    .btn-back { padding: 0.4rem 0.8rem; background: none; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .btn-back:hover { background: #F7F8FA; }
    .top-title { flex: 1; font-size: 0.95rem; font-weight: 700; color: #1C1C1C; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .top-actions { display: flex; gap: 0.6rem; }

    .center-state { padding: 4rem; text-align: center; color: #888; font-size: 0.9rem; }
    .error-text { color: #DC2626; }
    .error-text p { margin-bottom: 1rem; }
    .error-banner { background: rgba(220,38,38,0.07); border: 1px solid rgba(220,38,38,0.2); color: #DC2626; padding: 0.7rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }

    /* ─── Two-column layout ─── */
    .layout { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; padding: 1.5rem 2rem; align-items: start; }
    @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }

    /* ─── Left: form cards ─── */
    .cards-col { display: flex; flex-direction: column; gap: 1rem; }
    .card { background: #fff; border: 1px solid #E8E8E8; border-radius: 10px; padding: 1.5rem; }
    .card-heading { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #1C1C1C; margin-bottom: 1.1rem; }
    .card-hint { font-size: 0.63rem; font-weight: 400; color: #AAAAAA; text-transform: none; letter-spacing: 0; margin-left: 0.4rem; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    .field-full { grid-column: 1 / -1; }
    .field label { font-size: 0.63rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; }
    .form-input { padding: 0.5rem 0.7rem; border: 1px solid #E8E8E8; border-radius: 6px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; background: #fff; transition: border-color 0.15s; }
    .form-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-input::placeholder { color: #CCCCCC; }
    .form-textarea { padding: 0.5rem 0.7rem; border: 1px solid #E8E8E8; border-radius: 6px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; resize: vertical; font-family: inherit; line-height: 1.55; background: #fff; transition: border-color 0.15s; }
    .form-textarea:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-textarea::placeholder { color: #CCCCCC; }
    .hint { font-size: 0.65rem; color: #AAAAAA; margin-top: 2px; }
    .char-hint { display: block; text-align: right; }
    .over { color: #DC2626 !important; }
    .checkboxes { flex-direction: row; gap: 1.25rem; align-items: center; flex-wrap: wrap; }
    .checkboxes label { font-size: 0.8rem; color: #555; text-transform: none; letter-spacing: 0; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-weight: 400; }

    .calc-row { display: flex; gap: 0.5rem; }
    .calc-chip { font-size: 0.77rem; color: #555; background: #F0F7F0; padding: 0.28rem 0.7rem; border-radius: 20px; }
    .calc-chip strong { color: #3D5A47; }

    .payment-guide { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.75rem; }
    .pg-item { font-size: 0.74rem; color: #666; padding: 0.28rem 0.6rem; background: #F7F8FA; border-radius: 4px; border-left: 2px solid #B87333; }
    .pg-item strong { color: #1C1C1C; margin-right: 0.35rem; }

    /* Image slots */
    .img-slots { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .img-slot { position: relative; width: 90px; height: 90px; border-radius: 8px; overflow: hidden; border: 2px solid #E8E8E8; background: #FAFAFA; flex-shrink: 0; }
    .slot-primary { border-color: rgba(184,115,51,0.5); }
    .slot-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .slot-actions { position: absolute; top: 3px; right: 3px; display: flex; flex-direction: column; gap: 3px; opacity: 0; transition: opacity 0.15s; }
    .img-slot:hover .slot-actions { opacity: 1; }
    .slot-btn { width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; }
    .slot-remove { background: rgba(220,38,38,0.85); color: #fff; }
    .slot-star { background: rgba(184,115,51,0.9); color: #fff; }
    .primary-tag { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(184,115,51,0.85); color: #fff; font-size: 0.48rem; font-weight: 700; text-transform: uppercase; text-align: center; padding: 2px 0; }
    .slot-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; cursor: pointer; gap: 2px; }
    .slot-plus { font-size: 1.5rem; color: #CCCCCC; line-height: 1; }
    .slot-lbl { font-size: 0.48rem; color: #AAAAAA; text-transform: uppercase; letter-spacing: 0.04em; }

    .btn-primary { padding: 0.5rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover { opacity: 0.88; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-secondary { padding: 0.5rem 1.1rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.875rem; cursor: pointer; transition: background 0.15s; }
    .btn-secondary:hover { background: #F7F8FA; }
    .bottom-bar { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }

    /* ─── Right: preview column ─── */
    .preview-col { position: sticky; top: 58px; }
    .preview-panel { background: #fff; border: 1px solid #E8E8E8; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; }

    /* Panel header */
    .pv-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #F0F0F0; }
    .pv-title { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
    .device-btns { display: flex; gap: 0px; border: 1px solid #E8E8E8; border-radius: 6px; overflow: hidden; }
    .dev-btn { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #fff; border: none; border-right: 1px solid #E8E8E8; color: #888; font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: background 0.12s, color 0.12s; }
    .dev-btn:last-child { border-right: none; }
    .dev-btn:hover { background: #F7F8FA; color: #555; }
    .dev-active { background: #1C1C1C !important; color: #fff !important; }

    .pv-size-label { font-size: 0.6rem; color: #AAAAAA; text-align: center; padding: 3px 0 2px; background: #FAFAFA; border-bottom: 1px solid #F0F0F0; letter-spacing: 0.04em; }

    /* Browser chrome */
    .browser-chrome { display: flex; align-items: center; gap: 8px; padding: 5px 10px; background: #F0F0F0; border-bottom: 1px solid #E0E0E0; }
    .chrome-dots { display: flex; gap: 4px; }
    .chrome-dots span { width: 8px; height: 8px; border-radius: 50%; background: #D0D0D0; }
    .chrome-dots span:nth-child(1) { background: #FF5F57; }
    .chrome-dots span:nth-child(2) { background: #FFBD2E; }
    .chrome-dots span:nth-child(3) { background: #28CA41; }
    .chrome-url { flex: 1; background: #fff; border: 1px solid #E0E0E0; border-radius: 4px; padding: 2px 8px; font-size: 0.58rem; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Scaled preview outer */
    .pv-outer { width: 100%; height: 560px; overflow: hidden; position: relative; }
    .pv-scaler { transform-origin: top left; }

    /* Store button */
    .btn-open-store { width: 100%; padding: 0.6rem; background: #1C1C1C; color: #fff; border: none; font-size: 0.78rem; font-weight: 600; cursor: pointer; letter-spacing: 0.03em; transition: background 0.15s; }
    .btn-open-store:hover { background: #333; }

    /* ═══════════════════════════════════════
       PRODUCT PAGE SIMULATION (pp-*)
       All styles prefixed with pp- to isolate
    ═══════════════════════════════════════ */
    .pp { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1C1C1C; }

    /* Announce bar */
    .pp-announce { background: #3D5A47; color: #fff; font-size: 11px; text-align: center; padding: 6px 12px; letter-spacing: 0.03em; }

    /* Header */
    .pp-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #F0F0F0; }
    .pp-logo { font-size: 14px; font-weight: 700; color: #1C1C1C; letter-spacing: -0.01em; white-space: nowrap; }
    .pp-nav-links { display: flex; gap: 16px; }
    .pp-nav-links span { font-size: 11px; color: #555; cursor: pointer; }
    .pp-head-icons { display: flex; gap: 10px; }
    .pp-icon { font-size: 13px; cursor: pointer; }

    /* Breadcrumb */
    .pp-breadcrumb { font-size: 10px; color: #AAAAAA; padding: 8px 20px; background: #FAFAFA; border-bottom: 1px solid #F0F0F0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pp-breadcrumb strong { color: #555; }

    /* Hero */
    .pp-hero { display: flex; gap: 32px; padding: 24px 20px; }

    /* Gallery column */
    .pp-gallery { flex-shrink: 0; width: 42%; }
    .pp-main-wrap { position: relative; width: 100%; aspect-ratio: 4/5; background: #F7F8FA; border-radius: 8px; overflow: hidden; border: 1px solid #F0F0F0; }
    .pp-main-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .pp-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #CCCCCC; font-size: 11px; }
    .pp-sticker { position: absolute; top: 10px; left: 10px; font-size: 8px; font-weight: 700; text-transform: uppercase; padding: 3px 7px; border-radius: 3px; letter-spacing: 0.04em; }
    .pp-new { background: #3D5A47; color: #fff; }
    .pp-best { background: #B87333; color: #fff; top: 30px; }
    .pp-thumbs { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .pp-thumb { width: 44px; height: 44px; border-radius: 5px; overflow: hidden; border: 2px solid #E8E8E8; cursor: pointer; }
    .pp-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .pp-thumb-sel { border-color: #B87333; }

    /* Info column */
    .pp-info { flex: 1; min-width: 0; }
    .pp-badge-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
    .pp-badge { font-size: 8px; font-weight: 600; text-transform: uppercase; padding: 2px 6px; background: rgba(184,115,51,0.08); color: #B87333; border-radius: 3px; border: 1px solid rgba(184,115,51,0.2); letter-spacing: 0.04em; }
    .pp-name { font-size: 18px; font-weight: 700; color: #1C1C1C; line-height: 1.25; margin: 0 0 4px; }
    .pp-sub { font-size: 11px; color: #888; margin: 0 0 8px; line-height: 1.4; }
    .pp-stars { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
    .pp-star-icons { color: #F59E0B; font-size: 12px; letter-spacing: 1px; }
    .pp-review-ct { font-size: 10px; color: #888; }
    .pp-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
    .pp-price { font-size: 22px; font-weight: 700; color: #1C1C1C; }
    .pp-price-empty { color: #CCC; }
    .pp-mrp { font-size: 14px; color: #AAAAAA; text-decoration: line-through; }
    .pp-off { font-size: 12px; font-weight: 700; color: #3D5A47; background: rgba(61,90,71,0.1); padding: 2px 6px; border-radius: 4px; }
    .pp-short { font-size: 11px; color: #555; line-height: 1.5; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .pp-stock-row { margin-bottom: 12px; }
    .pp-instock { font-size: 10px; color: #3D5A47; font-weight: 600; }
    .pp-low { font-size: 10px; color: #B45309; font-weight: 600; }
    .pp-out { font-size: 10px; color: #DC2626; font-weight: 600; }
    .pp-cart-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .pp-qty { display: flex; align-items: center; border: 1px solid #E8E8E8; border-radius: 6px; overflow: hidden; }
    .pp-qty button { width: 28px; height: 36px; border: none; background: #F7F8FA; color: #555; font-size: 14px; cursor: pointer; }
    .pp-qty span { width: 28px; text-align: center; font-size: 12px; font-weight: 600; }
    .pp-add-btn { flex: 1; padding: 9px 14px; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .pp-buy-btn { width: 100%; padding: 9px; border: 2px solid #B87333; background: #fff; color: #B87333; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; margin-bottom: 10px; }
    .pp-pay-badge { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #555; padding: 6px 10px; background: #F7F8FA; border-radius: 6px; margin-bottom: 8px; }
    .pp-pay-icon { font-size: 12px; }
    .pp-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pp-pill { font-size: 9px; padding: 3px 7px; background: #F0F7F0; color: #3D5A47; border-radius: 20px; font-weight: 600; }

    /* Tabs section */
    .pp-tabs-section { border-top: 1px solid #F0F0F0; margin: 0 20px; }
    .pp-tabs-bar { display: flex; border-bottom: 1px solid #F0F0F0; }
    .pp-tab { padding: 8px 14px; font-size: 10px; font-weight: 600; color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .pp-tab-sel { color: #B87333; border-bottom-color: #B87333; }
    .pp-tab-content { padding: 12px 0 16px; font-size: 10px; color: #555; line-height: 1.6; }

    /* ─── Mobile overrides ─── */
    .pp-mobile .pp-hero { flex-direction: column; gap: 16px; padding: 16px; }
    .pp-mobile .pp-gallery { width: 100%; }
    .pp-mobile .pp-main-wrap { aspect-ratio: 3/4; }
    .pp-mobile .pp-nav-links { display: none; }
    .pp-mobile .pp-name { font-size: 16px; }
    .pp-mobile .pp-price { font-size: 18px; }
    .pp-mobile .pp-head { padding: 10px 16px; }
    .pp-mobile .pp-tabs-section { margin: 0 16px; }

    /* ─── Tablet overrides ─── */
    .pp-tablet .pp-hero { padding: 24px 32px; }
    .pp-tablet .pp-head { padding: 14px 32px; }
    .pp-tablet .pp-breadcrumb { padding: 8px 32px; }
    .pp-tablet .pp-tabs-section { margin: 0 32px; }
    .pp-tablet .pp-gallery { width: 44%; }

    /* ─── Desktop overrides ─── */
    .pp-desktop .pp-hero { padding: 40px 80px; gap: 48px; max-width: 1200px; margin: 0 auto; }
    .pp-desktop .pp-head { padding: 18px 80px; }
    .pp-desktop .pp-breadcrumb { padding: 8px 80px; }
    .pp-desktop .pp-tabs-section { margin: 0 80px; max-width: 1040px; }
    .pp-desktop .pp-name { font-size: 24px; }
    .pp-desktop .pp-price { font-size: 26px; }
    .pp-desktop .pp-add-btn { font-size: 13px; padding: 11px 18px; }
    .pp-desktop .pp-gallery { width: 46%; }
  `]
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
    if (keptUrls.length) fd.append('existing_images', JSON.stringify(keptUrls));
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
