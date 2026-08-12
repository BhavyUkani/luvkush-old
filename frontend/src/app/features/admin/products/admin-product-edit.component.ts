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
  template: `
    <div class="edit-page">

      <!-- Sticky Top Bar -->
      <div class="top-bar">
        <div class="top-left">
          <a class="btn-crumb-back" (click)="goBack()">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Products
          </a>
          <span class="top-sep"></span>
          <div class="top-title">
            <span class="top-title-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41L11 3.83A2 2 0 009.5 3H4a1 1 0 00-1 1v5.5a2 2 0 00.59 1.41l9.58 9.58a2 2 0 002.83 0l4.59-4.59a2 2 0 000-2.83z"/><circle cx="7.5" cy="7.5" r="1.25"/></svg></span>
            <span class="top-title-text">{{ isNew() ? 'Add Product' : (!loading() && !error() ? (form().name || 'Edit Product') : 'Edit Product') }}</span>
            @if (!isNew() && !loading() && !error()) {
              <span class="top-title-badge" [class]="'ts-' + form().status">
                <span class="ts-dot"></span>{{ form().status }}
              </span>
            }
          </div>
        </div>
        <div class="top-actions">
          <button class="btn-discard" (click)="goBack()">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Discard
          </button>
          <button class="btn-save" (click)="saveProduct()" [disabled]="saving() || loading()">
            @if (saving()) {
              <span class="btn-spinner"></span> Saving…
            } @else {
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isNew() ? 'Create Product' : 'Save Changes' }}
            }
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
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.3" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2V11.5M8 5V5.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span>
                General
              </div>
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
                  <div class="select-wrap">
                    <select [(ngModel)]="form().category_id" class="form-input form-select">
                      <option value="">Select category…</option>
                      @for (cat of filteredCategories(); track cat.id) {
                        <option [value]="cat.id">{{ cat.name }}</option>
                      }
                    </select>
                    <svg class="select-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
                <div class="field">
                  <label>Status</label>
                  <div class="select-wrap">
                    <select [(ngModel)]="form().status" class="form-input form-select">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                    <svg class="select-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
                <div class="field field-full">
                  <label>Product Flags</label>
                  <div class="flag-row">
                    <button type="button" class="flag-chip" [class.flag-chip--active]="form().is_featured" (click)="form().is_featured = !form().is_featured">
                      <svg width="14" height="14" viewBox="0 0 16 16" [attr.fill]="form().is_featured ? 'currentColor' : 'none'"><path d="M8 1.3L9.9 5.7L14.8 6.2L11.1 9.4L12.2 14.2L8 11.6L3.8 14.2L4.9 9.4L1.2 6.2L6.1 5.7L8 1.3Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
                      Featured on Homepage
                    </button>
                    <button type="button" class="flag-chip" [class.flag-chip--active]="form().is_bestseller" (click)="form().is_bestseller = !form().is_bestseller">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 2H11V6.5C11 8.4 9.7 10 8 10C6.3 10 5 8.4 5 6.5V2Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 3H2.5V4.5C2.5 5.9 3.6 7 5 7M11 3H13.5V4.5C13.5 5.9 12.4 7 11 7" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M8 10V12.5M6 14.5H10M6.5 12.5H9.5V13.3C9.5 13.9 9 14.5 8.4 14.5H7.6C7 14.5 6.5 13.9 6.5 13.3V12.5Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
                      Bestseller Badge
                    </button>
                    <button type="button" class="flag-chip" [class.flag-chip--active]="form().is_new" (click)="form().is_new = !form().is_new">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.2 5.2L13 5.5L10.1 8L11 11.7L8 9.6L5 11.7L5.9 8L3 5.5L6.8 5.2L8 1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
                      New Arrival
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Images -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="5.5" cy="6" r="1.2" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11L5.5 7.5L8.5 10.5L11 8.5L14.5 11.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg></span>
                Images <span class="card-hint">first = primary · max 5</span>
              </div>
              <div class="img-slots">
                @for (slot of imgSlots(); track slot.id; let i = $index) {
                  <div class="img-slot" [class.slot-primary]="i === 0">
                    @if (slot.preview) {
                      <img [src]="slot.preview" class="slot-img" alt="Image {{ i + 1 }}" />
                      <div class="slot-actions">
                        <button type="button" class="slot-btn slot-remove" (click)="removeSlot(i)" title="Remove">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                        </button>
                        @if (i > 0) {
                          <button type="button" class="slot-btn slot-star" (click)="setSlotPrimary(i)" title="Set primary">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.3L9.9 5.7L14.8 6.2L11.1 9.4L12.2 14.2L8 11.6L3.8 14.2L4.9 9.4L1.2 6.2L6.1 5.7L8 1.3Z"/></svg>
                          </button>
                        }
                      </div>
                      @if (i === 0) { <span class="primary-tag">Primary</span> }
                    } @else {
                      <label class="slot-empty" [for]="'img-' + i">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3V15M3 9H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
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
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.5 1.5H10L13 4.5V14.5H3.5V1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M6 8H11M6 10.5H11M6 5.5H8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg></span>
                Description
              </div>
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
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4.5" width="13" height="7.5" rx="1.4" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8.25" r="1.7" stroke="currentColor" stroke-width="1.1"/></svg></span>
                Inventory &amp; Pricing
              </div>
              <div class="form-grid">
                <div class="field">
                  <label>Selling Price *</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon">₹</span>
                    <input type="number" [(ngModel)]="form().price" class="form-input has-icon" placeholder="399" />
                  </div>
                </div>
                <div class="field">
                  <label>MRP</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon">₹</span>
                    <input type="number" [(ngModel)]="form().mrp" class="form-input has-icon" placeholder="499" />
                  </div>
                </div>
                <div class="field">
                  <label>Cost Price</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon">₹</span>
                    <input type="number" [(ngModel)]="form().cost_price" class="form-input has-icon" placeholder="150" />
                  </div>
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
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M4 6V8M6.5 6V7.3M9 6V8M11.5 6V7.3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg></span>
                Physical <span class="card-hint">for Shiprocket shipping</span>
              </div>
              <div class="form-grid">
                <div class="field">
                  <label>Weight</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon input-icon--sm">g</span>
                    <input type="number" [(ngModel)]="form().weight" class="form-input has-icon" placeholder="100" />
                  </div>
                </div>
                <div class="field">
                  <label>Length</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon input-icon--sm">cm</span>
                    <input type="number" [(ngModel)]="form().length_cm" class="form-input has-icon" placeholder="8" step="0.1" />
                  </div>
                </div>
                <div class="field">
                  <label>Width</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon input-icon--sm">cm</span>
                    <input type="number" [(ngModel)]="form().width_cm" class="form-input has-icon" placeholder="6" step="0.1" />
                  </div>
                </div>
                <div class="field">
                  <label>Height</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon input-icon--sm">cm</span>
                    <input type="number" [(ngModel)]="form().height_cm" class="form-input has-icon" placeholder="3" step="0.1" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.4" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 6.5H14.5" stroke="currentColor" stroke-width="1.2"/><path d="M3.5 9.5H6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></span>
                Payment
              </div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>Payment Mode</label>
                  <div class="select-wrap">
                    <select [(ngModel)]="form().payment_mode" class="form-input form-select">
                      <option value="full_cod">Complete COD — Pay on delivery</option>
                      <option value="full_online">Complete Online — No COD</option>
                      <option value="partial">Partial — Advance + rest on delivery</option>
                      <option value="hybrid">Hybrid — Customer chooses COD / Online</option>
                    </select>
                    <svg class="select-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
                @if (form().payment_mode === 'partial') {
                  <div class="field">
                    <label>Advance Amount</label>
                    <div class="input-icon-wrap">
                      <span class="input-icon">₹</span>
                      <input type="number" [(ngModel)]="form().advance_amount" class="form-input has-icon" placeholder="500" />
                    </div>
                    <span class="hint">Paid online upfront; balance on delivery.</span>
                  </div>
                }
              </div>
              <div class="payment-guide">
                <div class="pg-item"><span class="pg-tag">full_cod</span> Standard products, local delivery</div>
                <div class="pg-item"><span class="pg-tag">full_online</span> High-value / pre-order</div>
                <div class="pg-item"><span class="pg-tag">partial</span> Hair wigs, patches, custom orders</div>
                <div class="pg-item"><span class="pg-tag">hybrid</span> Both COD and online acceptable</div>
              </div>
            </div>

            <!-- SEO -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.3"/><path d="M10.7 10.7L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span>
                SEO
              </div>
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
              <button class="btn-secondary" (click)="goBack()">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                Discard
              </button>
              <button class="btn-primary" (click)="saveProduct()" [disabled]="saving()">
                @if (saving()) {
                  <span class="btn-spinner"></span> Saving…
                } @else {
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  {{ isNew() ? 'Create Product' : 'Save Changes' }}
                }
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

                  <!-- ── Simulated Product Page (mirrors live storefront design) ── -->
                  <div class="pp" [class.pp-mobile]="previewDevice() === 'mobile'"
                                  [class.pp-tablet]="previewDevice() === 'tablet'"
                                  [class.pp-desktop]="previewDevice() === 'desktop'">

                    <!-- Announcement bar -->
                    <div class="pp-announce">🌿 Free Pan-India Delivery on orders above ₹499</div>

                    <!-- Header -->
                    <div class="pp-head">
                      <span class="pp-burger"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></span>
                      <div class="pp-logo">
                        <span class="pp-logo-main">Luv Kush</span>
                        <span class="pp-logo-sub">NATURAL</span>
                      </div>
                      <div class="pp-head-icons">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                      </div>
                    </div>

                    <!-- Breadcrumb -->
                    <div class="pp-breadcrumb">
                      Home <span class="pp-crumb-sep">/</span> {{ selectedCategoryName() || 'Category' }} <span class="pp-crumb-sep">/</span> <strong>{{ form().name || 'Product name' }}</strong>
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
                              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            </div>
                          }
                        </div>
                        <!-- Thumbnail row -->
                        @if (imgSlots()[1].preview || imgSlots()[2].preview) {
                          <div class="pp-thumbs">
                            @for (slot of imgSlots(); track slot.id) {
                              @if (slot.preview) {
                                <div class="pp-thumb" [class.pp-thumb-sel]="slot.id === 0">
                                  <img [src]="slot.preview" />
                                </div>
                              }
                            }
                          </div>
                        }
                      </div>

                      <!-- Product Info -->
                      <div class="pp-info">

                        <!-- Badges row (matches real pd__badges) -->
                        @if (form().is_bestseller || form().is_new || getDiscount() > 0) {
                          <div class="pp-badge-row">
                            @if (form().is_bestseller) { <span class="pp-badge pp-badge--best">Bestseller</span> }
                            @if (form().is_new) { <span class="pp-badge pp-badge--new">New arrival</span> }
                            @if (getDiscount() > 0) { <span class="pp-badge pp-badge--sale">{{ getDiscount() }}% off</span> }
                          </div>
                        }

                        <h1 class="pp-name">{{ form().name || 'Product name' }}</h1>

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
                            <span class="pp-price">{{ +form().price | inr }}</span>
                          } @else {
                            <span class="pp-price pp-price-empty">₹ —</span>
                          }
                          @if (form().mrp && +form().mrp > +form().price) {
                            <span class="pp-mrp">{{ +form().mrp | inr }}</span>
                            <span class="pp-off">{{ getDiscount() }}% off</span>
                          }
                        </div>
                        <p class="pp-tax-note">Inclusive of all taxes &middot; Free delivery above ₹499</p>

                        <!-- Short description -->
                        @if (form().short_description) {
                          <p class="pp-short">{{ form().short_description }}</p>
                        }

                        <!-- Stock -->
                        @if (form().stock_quantity !== '' && +form().stock_quantity === 0) {
                          <p class="pp-stock pp-stock--oos">Out of stock</p>
                        } @else if (form().stock_quantity !== '' && +form().stock_quantity < 10) {
                          <p class="pp-stock pp-stock--low">Only {{ form().stock_quantity }} left — order soon</p>
                        }

                        <!-- Qty + Cart -->
                        <div class="pp-cart-row">
                          <div class="pp-qty"><button>−</button><span>1</span><button>+</button></div>
                          <button class="pp-add-btn">Add to cart</button>
                          <button class="pp-buy-btn">Buy now</button>
                        </div>

                        <!-- Payment note -->
                        @if (form().payment_mode !== 'full_cod') {
                          <p class="pp-pay-note">{{ paymentLabel() }}</p>
                        }

                        <!-- Trust badges -->
                        <div class="pp-trust">
                          <span class="pp-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 100% authentic</span>
                          <span class="pp-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12l3 3 5-5"/></svg> Ayurvedic certified</span>
                          <span class="pp-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12H2l10-10 10 10h-3v9H5v-9z"/></svg> 7-day free returns</span>
                          <span class="pp-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> 5–7 day delivery</span>
                        </div>

                      </div><!-- /pp-info -->
                    </div><!-- /pp-hero -->

                    <!-- Description section (mirrors real numbered-rail section) -->
                    <div class="pp-section">
                      <div class="pp-section-rail"><span class="pp-section-dot"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span></div>
                      <div class="pp-section-col">
                        <span class="pp-section-n">01</span>
                        <span class="pp-eyebrow">About this formula</span>
                        <h2 class="pp-section-title">Description</h2>
                        <p class="pp-prose">{{ (form().description || 'Product description will appear here after you fill in the Full Description field above.') | slice:0:220 }}{{ form().description && form().description.length > 220 ? '…' : '' }}</p>
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

    .top-bar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.8rem 2rem; background: #fff; border-bottom: 1px solid #E0D8C8; box-shadow: 0 1px 6px rgba(0,0,0,0.03); }
    .top-left { display: flex; align-items: center; gap: 0.85rem; min-width: 0; }
    .btn-crumb-back { display: inline-flex; align-items: center; gap: 0.35rem; color: #B87333; font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: none; flex-shrink: 0; transition: color 0.15s; }
    .btn-crumb-back:hover { color: #9d5d22; text-decoration: underline; }
    .top-sep { width: 1px; height: 18px; background: #E0D8C8; flex-shrink: 0; }
    .top-title { flex: 1; font-size: 0.95rem; font-weight: 700; color: #1C1C1C; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
    .top-title-icon { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 7px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
    .top-title-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .top-title-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 9px; border-radius: 20px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
    .ts-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .top-title-badge.ts-active { background: rgba(21,128,61,0.1); color: #15803D; }
    .top-title-badge.ts-inactive { background: rgba(180,83,9,0.1); color: #B45309; }
    .top-title-badge.ts-draft { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .top-title-badge.ts-archived { background: rgba(75,85,99,0.1); color: #4B5563; }
    .btn-discard { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; background: #fff; border: 1px solid #E0D8C8; color: #888; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .btn-discard:hover { background: rgba(220,38,38,0.05); border-color: rgba(220,38,38,0.3); color: #DC2626; }
    .btn-save { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1.35rem; background: #B87333; color: #fff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 10px rgba(184,115,51,0.28); transition: all 0.15s; }
    .btn-save:hover:not(:disabled) { background: #9d5d22; box-shadow: 0 3px 14px rgba(184,115,51,0.35); transform: translateY(-1px); }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
    .top-actions { display: flex; gap: 0.6rem; }
    .btn-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .center-state { padding: 4rem; text-align: center; color: #888; font-size: 0.9rem; }
    .error-text { color: #DC2626; }
    .error-text p { margin-bottom: 1rem; }
    .error-banner { background: rgba(220,38,38,0.07); border: 1px solid rgba(220,38,38,0.2); color: #DC2626; padding: 0.7rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }

    /* ─── Two-column layout ─── */
    .layout { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; padding: 1.5rem 2rem; align-items: start; }
    @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }

    /* ─── Left: form cards ─── */
    .cards-col { display: flex; flex-direction: column; gap: 1rem; }
    .card { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; padding: 1.5rem; transition: box-shadow 0.15s; }
    .card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
    .card-heading { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #1C1C1C; margin-bottom: 1.1rem; }
    .card-icon { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 7px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
    .card-hint { font-size: 0.63rem; font-weight: 400; color: #AAAAAA; text-transform: none; letter-spacing: 0; margin-left: 0.4rem; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    .field-full { grid-column: 1 / -1; }
    .field label { font-size: 0.63rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; }
    .form-input { padding: 0.55rem 0.75rem; border: 1px solid #E0D8C8; border-radius: 8px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; background: #fff; transition: border-color 0.15s, box-shadow 0.15s; }
    .form-input:hover { border-color: #D0C4AE; }
    .form-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-input::placeholder { color: #CCCCCC; }
    .form-select { appearance: none; padding-right: 2rem; cursor: pointer; }
    .select-wrap { position: relative; display: flex; align-items: center; }
    .select-wrap .select-caret { position: absolute; right: 0.85rem; color: #999; pointer-events: none; }
    .input-icon-wrap { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 0.75rem; color: #999; font-size: 0.8rem; font-weight: 600; pointer-events: none; }
    .input-icon--sm { font-size: 0.68rem; }
    .form-input.has-icon { padding-left: 1.9rem; }
    .form-textarea { padding: 0.55rem 0.75rem; border: 1px solid #E0D8C8; border-radius: 8px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; resize: vertical; font-family: inherit; line-height: 1.55; background: #fff; transition: border-color 0.15s, box-shadow 0.15s; }
    .form-textarea:hover { border-color: #D0C4AE; }
    .form-textarea:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-textarea::placeholder { color: #CCCCCC; }
    .hint { font-size: 0.65rem; color: #AAAAAA; margin-top: 2px; }
    .char-hint { display: block; text-align: right; }
    .over { color: #DC2626 !important; }

    .flag-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .flag-chip { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.5rem 0.9rem; border-radius: 20px; border: 1px solid #E0D8C8; background: #fff; color: #777; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .flag-chip:hover { border-color: #D0C4AE; background: #FAF8F5; }
    .flag-chip--active { border-color: rgba(184,115,51,0.5); background: rgba(184,115,51,0.08); color: #B87333; font-weight: 600; }

    .calc-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .calc-chip { font-size: 0.77rem; color: #555; background: rgba(21,128,61,0.07); border: 1px solid rgba(21,128,61,0.2); padding: 0.32rem 0.8rem; border-radius: 20px; }
    .calc-chip strong { color: #15803D; }

    .payment-guide { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.9rem; }
    .pg-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.78rem; color: #666; padding: 0.4rem 0.7rem; background: #FAF8F5; border-radius: 6px; }
    .pg-tag { font-size: 0.65rem; font-weight: 700; color: #B87333; background: rgba(184,115,51,0.1); padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }

    /* Image slots */
    .img-slots { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .img-slot { position: relative; width: 92px; height: 92px; border-radius: 10px; overflow: hidden; border: 2px solid #E0D8C8; background: #FAF8F5; flex-shrink: 0; transition: border-color 0.15s; }
    .img-slot:hover { border-color: #D0C4AE; }
    .slot-primary { border-color: rgba(184,115,51,0.5); }
    .slot-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .slot-actions { position: absolute; top: 4px; right: 4px; display: flex; flex-direction: column; gap: 4px; opacity: 0; transition: opacity 0.15s; }
    .img-slot:hover .slot-actions { opacity: 1; }
    .slot-btn { width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .slot-remove { background: rgba(220,38,38,0.9); color: #fff; }
    .slot-star { background: rgba(184,115,51,0.95); color: #fff; }
    .primary-tag { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(184,115,51,0.88); color: #fff; font-size: 0.48rem; font-weight: 700; text-transform: uppercase; text-align: center; padding: 2px 0; letter-spacing: 0.04em; }
    .slot-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; cursor: pointer; gap: 4px; color: #C4B8A4; transition: color 0.15s; }
    .slot-empty:hover { color: #B87333; }
    .slot-lbl { font-size: 0.48rem; color: #AAAAAA; text-transform: uppercase; letter-spacing: 0.04em; }

    .btn-primary { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover { opacity: 0.88; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-secondary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; background: #fff; border: 1px solid #E0D8C8; color: #555; border-radius: 8px; font-size: 0.875rem; cursor: pointer; transition: background 0.15s; }
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
       Mirrors the live storefront's actual design tokens
       (var(--lk-*)) and fonts so this preview matches
       "Preview on Store" as closely as possible.
    ═══════════════════════════════════════ */
    .pp { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--lk-white, #fff); color: var(--lk-body, #4B564F); }

    /* Announce bar */
    .pp-announce { background: linear-gradient(135deg, var(--lk-green-900, #14301F) 0%, var(--lk-green-800, #1C4229) 100%); color: #fff; font-size: 10.5px; font-weight: 600; text-align: center; padding: 7px 12px; letter-spacing: 0.02em; }

    /* Header */
    .pp-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 20px; background: var(--lk-green-700, #265539); }
    .pp-burger { display: flex; }
    .pp-logo { display: flex; flex-direction: column; align-items: center; line-height: 1; }
    .pp-logo-main { font-family: 'DM Serif Display', Georgia, serif; font-size: 15px; color: #fff; letter-spacing: 0.01em; }
    .pp-logo-sub { font-family: 'Outfit', sans-serif; font-size: 7px; font-weight: 600; letter-spacing: 0.22em; color: rgba(255,255,255,0.75); margin-top: 1px; }
    .pp-head-icons { display: flex; gap: 12px; }

    /* Breadcrumb */
    .pp-breadcrumb { font-family: 'Outfit', sans-serif; font-size: 9.5px; color: var(--lk-muted, #7B857E); padding: 8px 20px; background: var(--lk-white, #fff); border-bottom: 1px solid var(--lk-line, #E3E8E3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pp-crumb-sep { color: var(--lk-faint, #A8B0AA); margin: 0 2px; }
    .pp-breadcrumb strong { color: var(--lk-ink, #16211A); font-weight: 500; }

    /* Hero */
    .pp-hero { display: flex; gap: 28px; padding: 22px 20px; }

    /* Gallery column */
    .pp-gallery { flex-shrink: 0; width: 42%; }
    .pp-main-wrap { position: relative; width: 100%; aspect-ratio: 1/1; background: linear-gradient(160deg, var(--lk-green-50, #F1F7F3) 0%, var(--lk-cream, #FBF9F4) 100%); border-radius: 45% 45% 10px 10px / 26% 26% 4% 4%; overflow: hidden; }
    .pp-main-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .pp-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--lk-faint, #A8B0AA); }
    .pp-thumbs { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .pp-thumb { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 2px solid var(--lk-line, #E3E8E3); cursor: pointer; }
    .pp-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .pp-thumb-sel { border-color: var(--lk-green-600, #2F6B49); }

    /* Info column */
    .pp-info { flex: 1; min-width: 0; }
    .pp-badge-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
    .pp-badge { font-family: 'Outfit', sans-serif; font-size: 8.5px; font-weight: 700; letter-spacing: 0.03em; padding: 3px 8px; border-radius: 20px; }
    .pp-badge--best { background: var(--lk-green-50, #F1F7F3); border: 1px solid var(--lk-green-100, #DFEDE4); color: var(--lk-green-700, #265539); }
    .pp-badge--new { background: var(--lk-green-600, #2F6B49); color: #fff; }
    .pp-badge--sale { background: var(--lk-orange-500, #E07A3E); color: #fff; }
    .pp-name { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: 19px; color: var(--lk-ink, #16211A); line-height: 1.18; margin: 0 0 4px; }
    .pp-sub { font-size: 11px; color: var(--lk-muted, #7B857E); margin: 0 0 8px; line-height: 1.4; }
    .pp-stars { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .pp-star-icons { color: var(--lk-star, #E0A03E); font-size: 12px; letter-spacing: 1px; }
    .pp-review-ct { font-size: 10px; color: var(--lk-muted, #7B857E); text-decoration: underline; text-underline-offset: 2px; }
    .pp-price-row { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; }
    .pp-price { font-family: 'Outfit', sans-serif; font-size: 21px; font-weight: 700; color: var(--lk-ink, #16211A); }
    .pp-price-empty { color: var(--lk-faint, #A8B0AA); }
    .pp-mrp { font-size: 13px; color: var(--lk-faint, #A8B0AA); text-decoration: line-through; }
    .pp-off { font-family: 'Outfit', sans-serif; font-size: 10.5px; font-weight: 700; color: var(--lk-orange-700, #A8501F); background: var(--lk-orange-50, #FDF5EE); padding: 2px 7px; border-radius: 20px; }
    .pp-tax-note { font-size: 10px; color: var(--lk-faint, #A8B0AA); margin: 4px 0 0; }
    .pp-short { font-size: 11px; color: var(--lk-body, #4B564F); line-height: 1.55; margin: 10px 0 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .pp-stock { font-size: 10.5px; font-weight: 600; margin: 10px 0 0; }
    .pp-stock--oos { color: var(--lk-faint, #A8B0AA); }
    .pp-stock--low { color: var(--lk-orange-600, #C4622B); }
    .pp-cart-row { display: flex; gap: 8px; margin: 12px 0 0; align-items: center; }
    .pp-qty { display: flex; align-items: center; border: 1px solid var(--lk-line, #E3E8E3); border-radius: 20px; overflow: hidden; flex-shrink: 0; }
    .pp-qty button { width: 24px; height: 30px; border: none; background: var(--lk-cream, #FBF9F4); color: var(--lk-ink, #16211A); font-size: 13px; cursor: pointer; }
    .pp-qty span { width: 22px; text-align: center; font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; }
    .pp-add-btn, .pp-buy-btn { flex: 1; padding: 8px 10px; border: none; border-radius: 20px; font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .pp-add-btn { background: var(--lk-green-700, #265539); color: #fff; }
    .pp-buy-btn { background: var(--lk-orange-500, #E07A3E); color: #fff; }
    .pp-pay-note { font-size: 10px; color: var(--lk-muted, #7B857E); margin: 8px 0 0; }
    .pp-trust { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px 10px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--lk-line, #E3E8E3); }
    .pp-trust-item { display: flex; align-items: center; gap: 5px; font-size: 9.5px; color: var(--lk-body, #4B564F); }
    .pp-trust-item svg { flex-shrink: 0; color: var(--lk-green-600, #2F6B49); }

    /* Description section (numbered rail, mirrors real .pd-section) */
    .pp-section { display: grid; grid-template-columns: 34px 1fr; column-gap: 12px; padding: 20px; border-top: 1px solid var(--lk-line, #E3E8E3); margin-top: 4px; }
    .pp-section-rail { display: flex; justify-content: center; }
    .pp-section-dot { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: var(--lk-white, #fff); border: 1px solid var(--lk-green-100, #DFEDE4); color: var(--lk-green-600, #2F6B49); flex-shrink: 0; }
    .pp-section-n { display: block; margin-bottom: 3px; font-family: 'Outfit', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; color: var(--lk-faint, #A8B0AA); }
    .pp-eyebrow { display: block; font-family: 'Outfit', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--lk-orange-600, #C4622B); margin-bottom: 4px; }
    .pp-section-title { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: 15px; color: var(--lk-ink, #16211A); margin: 0 0 8px; }
    .pp-prose { font-size: 11px; color: var(--lk-body, #4B564F); line-height: 1.6; margin: 0; }

    /* ─── Mobile overrides ─── */
    .pp-mobile .pp-hero { flex-direction: column; gap: 16px; padding: 16px; }
    .pp-mobile .pp-gallery { width: 100%; }
    .pp-mobile .pp-name { font-size: 17px; }
    .pp-mobile .pp-price { font-size: 19px; }
    .pp-mobile .pp-head { padding: 9px 16px; }
    .pp-mobile .pp-section { padding: 16px; }

    /* ─── Tablet overrides ─── */
    .pp-tablet .pp-hero { padding: 22px 32px; }
    .pp-tablet .pp-head { padding: 12px 32px; }
    .pp-tablet .pp-breadcrumb { padding: 8px 32px; }
    .pp-tablet .pp-section { padding: 20px 32px; }
    .pp-tablet .pp-gallery { width: 44%; }

    /* ─── Desktop overrides ─── */
    .pp-desktop .pp-hero { padding: 36px 80px; gap: 48px; max-width: 1200px; margin: 0 auto; }
    .pp-desktop .pp-head { padding: 16px 80px; }
    .pp-desktop .pp-breadcrumb { padding: 8px 80px; }
    .pp-desktop .pp-section { padding: 24px 80px; max-width: 1040px; }
    .pp-desktop .pp-name { font-size: 25px; }
    .pp-desktop .pp-price { font-size: 26px; }
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
