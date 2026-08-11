import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminToastService } from '../shared/admin-toast.service';

const EMPTY = () => ({
  name: '', short_description: '', description: '',
  base_price: '', mrp: '', gender: '', size_info: '', colour_info: '',
  how_to_use: '', status: 'active', payment_mode: 'full_cod', advance_amount: ''
});

type Device = 'mobile' | 'tablet' | 'desktop';
const DEVICE_W: Record<Device, number> = { mobile: 375, tablet: 768, desktop: 1280 };
const PANEL_W = 344;

@Component({
  selector: 'lk-admin-hair-wig-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="edit-page">

      <!-- Top Bar -->
      <div class="top-bar">
        <button class="btn-back" (click)="goBack()">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Hair Wigs
        </button>
        <div class="top-title">
          <span>{{ isNew() ? 'Add Hair Wig' : (form().name || 'Edit Hair Wig') }}</span>
          @if (!isNew() && !loading() && !error()) { <span class="top-title-badge">{{ form().status }}</span> }
        </div>
        <div class="top-actions">
          <button class="btn-secondary" (click)="goBack()">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Discard
          </button>
          <button class="btn-primary" (click)="save()" [disabled]="saving() || loading()">
            @if (saving()) {
              <span class="btn-spinner"></span> Saving…
            } @else {
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isNew() ? 'Create Wig' : 'Save Changes' }}
            }
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="center-state">Loading…</div>
      } @else if (error()) {
        <div class="center-state error-text"><p>{{ error() }}</p>
          <button class="btn-secondary" (click)="goBack()">← Go Back</button>
        </div>
      } @else {
        <div class="layout">

          <!-- LEFT: Form Cards -->
          <div class="cards-col">

            @if (formError()) { <div class="error-banner">{{ formError() }}</div> }

            <!-- General -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.3" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2V11.5M8 5V5.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span>
                General
              </div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>Name *</label>
                  <input type="text" [(ngModel)]="form().name" class="form-input" placeholder="e.g. Premium Natural Hair Wig" />
                </div>
                <div class="field field-full">
                  <label>Short Description / Tagline</label>
                  <input type="text" [(ngModel)]="form().short_description" class="form-input" placeholder="Brief tagline shown in listings" />
                </div>
                <div class="field">
                  <label>Gender</label>
                  <div class="select-wrap">
                    <select [(ngModel)]="form().gender" class="form-input form-select">
                      <option value="">Select…</option>
                      <option value="male">Men</option>
                      <option value="female">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                    <svg class="select-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
                <div class="field">
                  <label>Status</label>
                  <div class="select-wrap">
                    <select [(ngModel)]="form().status" class="form-input form-select">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                    <svg class="select-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="5.5" cy="6" r="1.2" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11L5.5 7.5L8.5 10.5L11 8.5L14.5 11.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg></span>
                Image
              </div>
              @if (isNew()) {
                <div class="new-img-note">Save the wig first, then upload an image from the edit page.</div>
              } @else {
                <div class="img-upload-area">
                  @if (imgPreview() || form().primary_image) {
                    <img [src]="imgPreview() || imgUrl(form().primary_image)" class="current-img" alt="Wig image" />
                  } @else {
                    <div class="img-placeholder">No image uploaded</div>
                  }
                  <label class="img-upload-btn">
                    <input type="file" accept="image/*" (change)="onImagePick($event)" hidden />
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    {{ imgPreview() ? 'Change Image' : (form().primary_image ? 'Replace Image' : 'Upload Image') }}
                  </label>
                  @if (imgUploading()) { <span class="uploading-msg"><span class="btn-spinner btn-spinner--dark"></span> Uploading…</span> }
                </div>
              }
            </div>

            <!-- Description -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.5 1.5H10L13 4.5V14.5H3.5V1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M6 8H11M6 10.5H11M6 5.5H8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg></span>
                Description
              </div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>Full Description</label>
                  <textarea [(ngModel)]="form().description" class="form-textarea" rows="5" placeholder="Full product description — materials, quality, origin…"></textarea>
                </div>
                <div class="field field-full">
                  <label>How To Use / Apply</label>
                  <textarea [(ngModel)]="form().how_to_use" class="form-textarea" rows="4" placeholder="Step 1: …&#10;Step 2: …"></textarea>
                </div>
              </div>
            </div>

            <!-- Variants -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 5C2 3.9 2.9 3 4 3H7L9 5H14C15.1 5 16 5.9 16 7V14C16 15.1 15.1 16 14 16H4C2.9 16 2 15.1 2 14V5Z" stroke="currentColor" stroke-width="1.2"/></svg></span>
                Variants
              </div>
              <div class="form-grid">
                <div class="field field-full">
                  <label>Size Info</label>
                  <input type="text" [(ngModel)]="form().size_info" class="form-input" placeholder="e.g. Small (54cm), Medium (56cm), Large (58cm)" />
                </div>
                <div class="field field-full">
                  <label>Colour / Shades Available</label>
                  <input type="text" [(ngModel)]="form().colour_info" class="form-input" placeholder="e.g. Natural Black, Dark Brown, Medium Brown" />
                </div>
              </div>
            </div>

            <!-- Pricing -->
            <div class="card">
              <div class="card-heading">
                <span class="card-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4.5" width="13" height="7.5" rx="1.4" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8.25" r="1.7" stroke="currentColor" stroke-width="1.1"/></svg></span>
                Pricing
              </div>
              <div class="form-grid">
                <div class="field">
                  <label>Price *</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon">₹</span>
                    <input type="number" [(ngModel)]="form().base_price" class="form-input has-icon" placeholder="5000" />
                  </div>
                </div>
                <div class="field">
                  <label>MRP</label>
                  <div class="input-icon-wrap">
                    <span class="input-icon">₹</span>
                    <input type="number" [(ngModel)]="form().mrp" class="form-input has-icon" placeholder="8000" />
                  </div>
                </div>
                @if (form().base_price && form().mrp && +form().mrp > +form().base_price) {
                  <div class="field-full">
                    <div class="calc-row">
                      <span class="calc-chip">Discount <strong>{{ getDiscount() }}%</strong></span>
                    </div>
                  </div>
                }
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
                      <option value="hybrid">Hybrid — Customer chooses</option>
                    </select>
                    <svg class="select-caret" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
                @if (form().payment_mode === 'partial') {
                  <div class="field">
                    <label>Advance Amount</label>
                    <div class="input-icon-wrap">
                      <span class="input-icon">₹</span>
                      <input type="number" [(ngModel)]="form().advance_amount" class="form-input has-icon" placeholder="2000" />
                    </div>
                    <span class="hint">Paid online; balance on delivery.</span>
                  </div>
                }
              </div>
            </div>

            <div class="bottom-bar">
              <button class="btn-secondary" (click)="goBack()">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                Discard
              </button>
              <button class="btn-primary" (click)="save()" [disabled]="saving()">
                @if (saving()) {
                  <span class="btn-spinner"></span> Saving…
                } @else {
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  {{ isNew() ? 'Create Wig' : 'Save Changes' }}
                }
              </button>
            </div>

          </div><!-- /cards-col -->

          <!-- RIGHT: Preview -->
          <div class="preview-col">
            <div class="preview-panel">
              <div class="pv-header">
                <span class="pv-title">Live Preview</span>
                <div class="device-btns">
                  <button class="dev-btn" [class.dev-active]="previewDevice() === 'mobile'" (click)="previewDevice.set('mobile')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/></svg> Mobile
                  </button>
                  <button class="dev-btn" [class.dev-active]="previewDevice() === 'tablet'" (click)="previewDevice.set('tablet')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/></svg> Tablet
                  </button>
                  <button class="dev-btn" [class.dev-active]="previewDevice() === 'desktop'" (click)="previewDevice.set('desktop')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg> Desktop
                  </button>
                </div>
              </div>
              <div class="pv-size-label">{{ previewDevice() === 'mobile' ? '375px' : previewDevice() === 'tablet' ? '768px' : '1280px' }} · {{ scalePercent() }}% zoom</div>
              <div class="browser-chrome">
                <div class="chrome-dots"><span></span><span></span><span></span></div>
                <div class="chrome-url">luvkushnatural.com/hair-wigs/…</div>
              </div>
              <div class="pv-outer">
                <div class="pv-scaler"
                     [style.width.px]="previewFrameWidth()"
                     [style.transform]="'scale(' + previewScale() + ')'">
                  <div class="pp" [class.pp-mobile]="previewDevice() === 'mobile'"
                                  [class.pp-tablet]="previewDevice() === 'tablet'"
                                  [class.pp-desktop]="previewDevice() === 'desktop'">
                    <div class="pp-announce">Custom Hair Wigs — Made to Measure · Free Consultation</div>
                    <div class="pp-head">
                      <div class="pp-logo">Luv Kush Natural</div>
                      <div class="pp-nav-links"><span>Home</span><span>Shop</span><span>About</span></div>
                      <div class="pp-head-icons"><span>🛒</span></div>
                    </div>
                    <div class="pp-breadcrumb">Home &rsaquo; Hair Wigs &rsaquo; <strong>{{ form().name || '…' }}</strong></div>
                    <div class="pp-hero">
                      <div class="pp-gallery">
                        <div class="pp-main-wrap">
                          @if (imgPreview() || form().primary_image) {
                            <img [src]="imgPreview() || imgUrl(form().primary_image)" class="pp-main-img" />
                          } @else {
                            <div class="pp-no-img"><span>No Image</span></div>
                          }
                          @if (form().gender) { <span class="pp-sticker pp-gender">{{ form().gender }}</span> }
                        </div>
                      </div>
                      <div class="pp-info">
                        <h1 class="pp-name">{{ form().name || 'Hair Wig Name' }}</h1>
                        @if (form().short_description) { <p class="pp-sub">{{ form().short_description }}</p> }
                        <div class="pp-stars"><span class="pp-star-icons">★★★★★</span><span class="pp-review-ct">12 reviews</span></div>
                        <div class="pp-price-row">
                          @if (form().base_price) { <span class="pp-price">₹{{ form().base_price }}</span> }
                          @else { <span class="pp-price pp-price-empty">₹ —</span> }
                          @if (form().mrp && +form().mrp > +form().base_price) {
                            <span class="pp-mrp">₹{{ form().mrp }}</span>
                            <span class="pp-off">{{ getDiscount() }}% OFF</span>
                          }
                        </div>
                        @if (form().size_info) {
                          <div class="pp-variant-row"><strong>Sizes:</strong> {{ form().size_info }}</div>
                        }
                        @if (form().colour_info) {
                          <div class="pp-variant-row"><strong>Colours:</strong> {{ form().colour_info }}</div>
                        }
                        @if (form().short_description) {
                          <p class="pp-short">{{ form().short_description }}</p>
                        }
                        <div class="pp-cart-row">
                          <div class="pp-qty"><button>−</button><span>1</span><button>+</button></div>
                          <button class="pp-add-btn">Add to Cart</button>
                        </div>
                        <button class="pp-buy-btn">Book Consultation</button>
                        <div class="pp-pay-badge"><span>💳</span><span>{{ paymentLabel() }}</span></div>
                        <div class="pp-pills">
                          <span class="pp-pill">✓ Custom Fit</span>
                          <span class="pp-pill">🚚 Pan India</span>
                          <span class="pp-pill">🔒 Secure</span>
                        </div>
                      </div>
                    </div>
                    @if (form().description) {
                      <div class="pp-desc-section">
                        <div class="pp-desc-heading">Description</div>
                        <div class="pp-desc-body">{{ form().description | slice:0:300 }}{{ form().description.length > 300 ? '…' : '' }}</div>
                      </div>
                    }
                  </div>
                </div>
              </div>
              <button class="btn-open-store" (click)="previewLive()">Preview on Store ↗</button>
            </div>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .edit-page { min-height: 100vh; background: #F7F8FA; }
    .top-bar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; gap: 1rem; padding: 0.7rem 2rem; background: #fff; border-bottom: 1px solid #E8E8E8; }
    .btn-back { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; background: none; border: 1px solid #E0D8C8; color: #555; border-radius: 8px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: background 0.15s; }
    .btn-back:hover { background: #F7F8FA; }
    .top-title { flex: 1; font-size: 0.95rem; font-weight: 700; color: #1C1C1C; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 0.6rem; }
    .top-title-badge { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 20px; background: rgba(184,115,51,0.1); color: #B87333; }
    .top-actions { display: flex; gap: 0.6rem; }
    .btn-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    .btn-spinner--dark { border-color: rgba(184,115,51,0.25); border-top-color: #B87333; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .center-state { padding: 4rem; text-align: center; color: #888; font-size: 0.9rem; }
    .error-text { color: #DC2626; }
    .error-text p { margin-bottom: 1rem; }
    .error-banner { background: rgba(220,38,38,0.07); border: 1px solid rgba(220,38,38,0.2); color: #DC2626; padding: 0.7rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
    .layout { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; padding: 1.5rem 2rem; align-items: start; }
    @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }
    .cards-col { display: flex; flex-direction: column; gap: 1rem; }
    .card { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; padding: 1.5rem; transition: box-shadow 0.15s; }
    .card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
    .card-heading { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #1C1C1C; margin-bottom: 1.1rem; }
    .card-icon { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 7px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
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
    .form-input.has-icon { padding-left: 1.9rem; }
    .form-textarea { padding: 0.55rem 0.75rem; border: 1px solid #E0D8C8; border-radius: 8px; color: #1C1C1C; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; resize: vertical; font-family: inherit; line-height: 1.55; background: #fff; transition: border-color 0.15s, box-shadow 0.15s; }
    .form-textarea:hover { border-color: #D0C4AE; }
    .form-textarea:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-textarea::placeholder { color: #CCCCCC; }
    .hint { font-size: 0.65rem; color: #AAAAAA; margin-top: 2px; }
    .calc-row { display: flex; gap: 0.5rem; }
    .calc-chip { font-size: 0.77rem; color: #555; background: rgba(21,128,61,0.07); border: 1px solid rgba(21,128,61,0.2); padding: 0.32rem 0.8rem; border-radius: 20px; }
    .calc-chip strong { color: #15803D; }
    .new-img-note { font-size: 0.8rem; color: #888; background: #FAF8F5; border: 1px dashed #E0D8C8; border-radius: 8px; padding: 0.75rem 1rem; }
    .img-upload-area { display: flex; flex-direction: column; gap: 0.75rem; }
    .current-img { width: 140px; height: 140px; object-fit: cover; border-radius: 10px; border: 1px solid #E8E8E8; }
    .img-placeholder { width: 140px; height: 140px; background: #F0F0F0; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #AAA; font-size: 0.78rem; }
    .img-upload-btn { display: inline-flex; align-items: center; gap: 0.4rem; width: fit-content; padding: 0.5rem 1rem; border: 1px dashed rgba(184,115,51,0.5); border-radius: 8px; color: #B87333; font-size: 0.8rem; font-weight: 600; cursor: pointer; background: rgba(184,115,51,0.04); transition: background 0.15s, border-color 0.15s; }
    .img-upload-btn:hover { background: rgba(184,115,51,0.1); border-color: #B87333; }
    .uploading-msg { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #B87333; }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover { opacity: 0.88; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-secondary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; background: #fff; border: 1px solid #E0D8C8; color: #555; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
    .btn-secondary:hover { background: #F7F8FA; }
    .bottom-bar { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }

    /* Preview panel */
    .preview-col { position: sticky; top: 58px; }
    .preview-panel { background: #fff; border: 1px solid #E8E8E8; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; }
    .pv-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #F0F0F0; }
    .pv-title { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
    .device-btns { display: flex; border: 1px solid #E8E8E8; border-radius: 6px; overflow: hidden; }
    .dev-btn { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #fff; border: none; border-right: 1px solid #E8E8E8; color: #888; font-size: 0.65rem; font-weight: 600; cursor: pointer; }
    .dev-btn:last-child { border-right: none; }
    .dev-btn:hover { background: #F7F8FA; }
    .dev-active { background: #1C1C1C !important; color: #fff !important; }
    .pv-size-label { font-size: 0.6rem; color: #AAAAAA; text-align: center; padding: 3px 0; background: #FAFAFA; border-bottom: 1px solid #F0F0F0; letter-spacing: 0.04em; }
    .browser-chrome { display: flex; align-items: center; gap: 8px; padding: 5px 10px; background: #F0F0F0; border-bottom: 1px solid #E0E0E0; }
    .chrome-dots { display: flex; gap: 4px; }
    .chrome-dots span { width: 8px; height: 8px; border-radius: 50%; }
    .chrome-dots span:nth-child(1) { background: #FF5F57; }
    .chrome-dots span:nth-child(2) { background: #FFBD2E; }
    .chrome-dots span:nth-child(3) { background: #28CA41; }
    .chrome-url { flex: 1; background: #fff; border: 1px solid #E0E0E0; border-radius: 4px; padding: 2px 8px; font-size: 0.58rem; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pv-outer { width: 100%; height: 540px; overflow: hidden; position: relative; }
    .pv-scaler { transform-origin: top left; }
    .btn-open-store { width: 100%; padding: 0.6rem; background: #1C1C1C; color: #fff; border: none; font-size: 0.78rem; font-weight: 600; cursor: pointer; letter-spacing: 0.03em; }
    .btn-open-store:hover { background: #333; }

    /* Product page simulation */
    .pp { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1C1C1C; }
    .pp-announce { background: #1C1C1C; color: #fff; font-size: 11px; text-align: center; padding: 6px 12px; }
    .pp-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #F0F0F0; }
    .pp-logo { font-size: 14px; font-weight: 700; }
    .pp-nav-links { display: flex; gap: 16px; }
    .pp-nav-links span { font-size: 11px; color: #555; }
    .pp-head-icons { font-size: 13px; }
    .pp-breadcrumb { font-size: 10px; color: #AAAAAA; padding: 8px 20px; background: #FAFAFA; border-bottom: 1px solid #F0F0F0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pp-breadcrumb strong { color: #555; }
    .pp-hero { display: flex; gap: 28px; padding: 24px 20px; }
    .pp-gallery { flex-shrink: 0; width: 44%; }
    .pp-main-wrap { position: relative; width: 100%; aspect-ratio: 3/4; background: #F7F8FA; border-radius: 8px; overflow: hidden; border: 1px solid #F0F0F0; }
    .pp-main-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .pp-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #CCC; font-size: 11px; }
    .pp-sticker { position: absolute; top: 10px; left: 10px; font-size: 8px; font-weight: 700; text-transform: uppercase; padding: 3px 7px; border-radius: 3px; }
    .pp-gender { background: #1C1C1C; color: #fff; }
    .pp-info { flex: 1; min-width: 0; }
    .pp-name { font-size: 17px; font-weight: 700; color: #1C1C1C; line-height: 1.25; margin: 0 0 4px; }
    .pp-sub { font-size: 11px; color: #888; margin: 0 0 8px; }
    .pp-stars { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
    .pp-star-icons { color: #F59E0B; font-size: 12px; }
    .pp-review-ct { font-size: 10px; color: #888; }
    .pp-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
    .pp-price { font-size: 22px; font-weight: 700; }
    .pp-price-empty { color: #CCC; }
    .pp-mrp { font-size: 14px; color: #AAAAAA; text-decoration: line-through; }
    .pp-off { font-size: 12px; font-weight: 700; color: #3D5A47; background: rgba(61,90,71,0.1); padding: 2px 6px; border-radius: 4px; }
    .pp-variant-row { font-size: 10px; color: #555; margin-bottom: 5px; }
    .pp-short { font-size: 11px; color: #555; line-height: 1.5; margin: 0 0 10px; }
    .pp-cart-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .pp-qty { display: flex; align-items: center; border: 1px solid #E8E8E8; border-radius: 6px; overflow: hidden; }
    .pp-qty button { width: 28px; height: 36px; border: none; background: #F7F8FA; color: #555; font-size: 14px; cursor: pointer; }
    .pp-qty span { width: 28px; text-align: center; font-size: 12px; font-weight: 600; }
    .pp-add-btn { flex: 1; padding: 9px 14px; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .pp-buy-btn { width: 100%; padding: 9px; border: 2px solid #B87333; background: #fff; color: #B87333; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; margin-bottom: 10px; }
    .pp-pay-badge { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #555; padding: 6px 10px; background: #F7F8FA; border-radius: 6px; margin-bottom: 8px; }
    .pp-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pp-pill { font-size: 9px; padding: 3px 7px; background: #F0F7F0; color: #3D5A47; border-radius: 20px; font-weight: 600; }
    .pp-desc-section { border-top: 1px solid #F0F0F0; margin: 0 20px; padding: 12px 0; }
    .pp-desc-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 6px; }
    .pp-desc-body { font-size: 10px; color: #555; line-height: 1.6; }
    .pp-mobile .pp-hero { flex-direction: column; padding: 16px; }
    .pp-mobile .pp-gallery { width: 100%; }
    .pp-mobile .pp-nav-links { display: none; }
    .pp-mobile .pp-name { font-size: 15px; }
    .pp-tablet .pp-hero { padding: 24px 32px; }
    .pp-tablet .pp-head { padding: 14px 32px; }
    .pp-tablet .pp-breadcrumb { padding: 8px 32px; }
    .pp-desktop .pp-hero { padding: 36px 80px; gap: 48px; max-width: 1200px; margin: 0 auto; }
    .pp-desktop .pp-head { padding: 18px 80px; }
    .pp-desktop .pp-breadcrumb { padding: 8px 80px; }
    .pp-desktop .pp-name { font-size: 22px; }
  `]
})
export class AdminHairWigEditComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(AdminToastService);
  readonly imgUrl = imageUrl;

  isNew = signal(false);
  itemId = signal<number>(0);
  loading = signal(true);
  error = signal('');
  saving = signal(false);
  formError = signal('');
  form = signal<any>(EMPTY());
  imgPreview = signal('');
  imgUploading = signal(false);
  previewDevice = signal<Device>('mobile');

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

  goBack(): void { this.router.navigate(['/admin/wigs']); }

  previewLive(): void { window.open('/hair-wigs', '_blank'); }

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
      ...f, type: 'wig',
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
        this.toast.success(this.isNew() ? 'Hair wig created' : 'Hair wig updated');
        if (this.isNew()) {
          const newId = res.data?.id;
          newId
            ? this.router.navigate(['/admin/wigs', newId, 'edit'])
            : this.router.navigate(['/admin/wigs']);
        } else {
          this.router.navigate(['/admin/wigs']);
        }
      },
      error: (err: any) => { this.saving.set(false); this.formError.set(err.userMessage || 'Save failed'); }
    });
  }
}
