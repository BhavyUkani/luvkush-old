import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminConfirmService } from '../shared/admin-confirm.service';
import { AdminToastService } from '../shared/admin-toast.service';
import { IndianCurrencyPipe } from '../shared/indian-currency.pipe';

interface Order {
  id: number;
  order_number: string;
  status: string;
  status_name?: string;
  status_color?: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  item_count?: number;
  advance_paid_amount?: number | null;
}

interface OrderDetail extends Order {
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  coupon_code: string | null;
  coupon_discount: number | null;
  special_instructions: string | null;
  shipping_address: string | ShippingAddress;
  user_phone: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  mrp: number;
  total_amount: number;
  primary_image: string | null;
  product_slug: string | null;
  sku?: string;
}

interface ShippingAddress {
  full_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

@Component({
  selector: 'lk-admin-order-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, IndianCurrencyPipe],
  template: `
    <div class="page">
      @if (loadingDetail()) {
        <div class="detail-loading">
          <span class="spinner-lg"></span>
          <div>Loading order details…</div>
        </div>
      } @else if (error()) {
        <div class="error-msg">
          {{ error() }}
          <button (click)="retryLoad()">Retry</button>
        </div>
      } @else if (detailOrder(); as d) {
        <div class="page-header">
          <div>
            <a routerLink="/admin/orders" class="btn-back">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Orders
            </a>
            <h1 class="order-title">
              <span class="order-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-6-5"/><path d="M9 2h6M3 7h18M9 12h6"/></svg>
              </span>
              Order {{ d.order_number }}
              <span class="order-date">{{ d.created_at | date:'dd MMM yyyy, hh:mm a' }}</span>
            </h1>
          </div>
          <div class="header-actions">
            <div class="status-selector">
              <label class="status-select-label">Order Status</label>
              <div class="status-select-wrap">
                <span class="status-badge" [style.background-color]="d.status_color + '15'" [style.color]="d.status_color" [style.border-color]="d.status_color + '40'">
                  <span class="status-dot" [style.background]="d.status_color"></span>
                  {{ d.status_name || formatStatus(d.status) }}
                </span>
                <div class="select-wrap select-wrap--header">
                  <select [value]="d.status" (change)="onStatusChange($event)" [disabled]="updatingStatus()" class="status-dropdown form-select">
                    @for (st of allStatuses(); track st.id) {
                      <option [value]="st.slug">{{ st.name }}</option>
                    }
                  </select>
                  <svg class="select-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                @if (updatingStatus()) { <span class="spinner-sm"></span> }
              </div>
            </div>
          </div>
        </div>

        <div class="detail-body">
          
          <!-- Row 1: 4 Cards (Customer, Shipping Address, Payments, Order Summary) -->
          <div class="detail-row-4">

            <!-- Card 1: Customer -->
            <div class="detail-card">
              <div class="dc-title">
                <span class="dc-icon dc-icon--blue"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                Customer
              </div>
              <div class="dc-val fw">{{ d.first_name }} {{ d.last_name }}</div>
              <div class="dc-val">{{ d.email }}</div>
              <div class="dc-val">{{ d.user_phone || d.phone || '—' }}</div>
            </div>

            <!-- Card 2: Shipping Address -->
            <div class="detail-card">
              <div class="dc-title">
                <span class="dc-icon dc-icon--purple"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
                Shipping Address
              </div>
              @if (shippingAddr()) {
                <div class="dc-val fw">{{ shippingAddr()!.full_name || (d.first_name + ' ' + d.last_name) }}</div>
                <div class="dc-val">{{ shippingAddr()!.address_line1 }}{{ shippingAddr()!.address_line2 ? ', ' + shippingAddr()!.address_line2 : '' }}</div>
                <div class="dc-val">{{ shippingAddr()!.city }}, {{ shippingAddr()!.state }} – {{ shippingAddr()!.pincode }}</div>
                <div class="dc-val">{{ shippingAddr()!.phone || '—' }}</div>
              } @else {
                <div class="dc-val muted">Address not available</div>
              }
            </div>

            <!-- Card 3: Payments -->
            <div class="detail-card">
              <div class="dc-title">
                <span class="dc-icon dc-icon--green"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></span>
                Payment
              </div>
              <div class="dc-val fw">{{ d.advance_paid_amount ? 'Partial (Advance)' : formatPaymentMethod(d.payment_method) }}</div>
              <div style="margin-top: 0.5rem;">
                <span class="badge badge-dot-wrap" [class]="'pay-' + d.payment_status"><span class="badge-dot"></span>{{ d.payment_status }}</span>
              </div>
              @if (d.coupon_code) {
                <div class="dc-val muted" style="margin-top: 0.5rem">Coupon: <strong>{{ d.coupon_code }}</strong></div>
              }
            </div>

            <!-- Card 4: Order Summary -->
            <div class="detail-card summary-card">
              <div class="dc-title">
                <span class="dc-icon dc-icon--copper"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 11V6a3 3 0 016 0v5M5 11h14l-1.5 9.5a2 2 0 01-2 1.5H8.5a2 2 0 01-2-1.5L5 11z"/></svg></span>
                Order Summary
              </div>
              <div class="summary-row"><span>Subtotal</span><span>{{ d.subtotal | inr }}</span></div>
              @if (d.discount_amount > 0) {
                <div class="summary-row green"><span>Discount</span><span>-{{ d.discount_amount | inr }}</span></div>
              }
              <div class="summary-row"><span>Shipping</span><span>{{ d.shipping_amount > 0 ? (d.shipping_amount | inr) : 'Free' }}</span></div>
              <div class="summary-row"><span>Tax (GST)</span><span>{{ d.tax_amount | inr }}</span></div>
              <div class="summary-row total"><span>Grand Total</span><span>{{ d.total_amount | inr }}</span></div>
            </div>

          </div>

          <!-- Tabs (Shown only if shipment not created) -->
          @if (!d.tracking_number) {
            <div class="tabs-container">
              <button class="tab-btn" [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-6-5"/><path d="M9 2h6M3 7h18M9 12h6"/></svg>
                Order Overview
              </button>
              <button class="tab-btn" [class.active]="activeTab() === 'booking'" (click)="activeTab.set('booking')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Book Shipment
              </button>
            </div>
          }

          <!-- TAB 1: OVERVIEW -->
          @if (d.tracking_number || activeTab() === 'overview') {
            <div class="detail-main-layout">

              <!-- Left Column: Products List & Special Instructions -->
              <div class="main-left">
                <!-- Products Table Card -->
                <div class="detail-card">
                  <div class="dc-title">
                    <span class="dc-icon dc-icon--copper"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.59 13.41L11 3.83A2 2 0 009.5 3H4a1 1 0 00-1 1v5.5a2 2 0 00.59 1.41l9.58 9.58a2 2 0 002.83 0l4.59-4.59a2 2 0 000-2.83z"/><circle cx="7.5" cy="7.5" r="1.25"/></svg></span>
                    Products <span class="count-chip">{{ d.items.length }}</span>
                  </div>
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th style="width:44px"></th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of d.items; track item.id) {
                        <tr>
                          <td>
                            @if (item.primary_image) {
                              <img [src]="imgUrl(item.primary_image)" class="item-thumb" [alt]="item.product_name" />
                            } @else {
                              <div class="item-thumb-empty">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              </div>
                            }
                          </td>
                          <td>
                            <div class="item-name">{{ item.product_name }}</div>
                            @if (item.variant_name) { <div class="item-variant">{{ item.variant_name }}</div> }
                          </td>
                          <td>{{ item.quantity }}</td>
                          <td>{{ item.unit_price | inr }}</td>
                          <td class="fw">{{ item.total_amount | inr }}</td>
                        </tr>
                      }
                      @if (!d.items.length) {
                        <tr><td colspan="5" class="empty-cell">No items</td></tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Special instructions -->
                @if (d.special_instructions) {
                  <div class="detail-card">
                    <div class="dc-title">
                      <span class="dc-icon dc-icon--amber"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/><path d="M9 13h6M9 17h6"/></svg></span>
                      Special Instructions
                    </div>
                    <div class="dc-val">{{ d.special_instructions }}</div>
                  </div>
                }

                <!-- Manual Tracking and Action Buttons at the Bottom -->
                <div class="bottom-actions">
                  <button class="btn-secondary" (click)="openTracking(d)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                    {{ d.tracking_number ? 'Update Tracking' : 'Manual Tracking' }}
                  </button>
                </div>
              </div>

              <!-- Right Column: Order History -->
              <div class="main-right">
                <div class="detail-card">
                  <div class="dc-top-row">
                    <div class="dc-title" style="margin-bottom:0">
                      <span class="dc-icon dc-icon--blue"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>
                      Order History
                    </div>
                    <button class="btn-update-sm" (click)="openUpdateModal()">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                      Update
                    </button>
                  </div>

                  @if (d.tracking_number) {
                    <div class="awb-strip">
                      <div class="dc-val fw" style="margin:0">AWB: {{ d.tracking_number }}</div>
                      @if (d.tracking_url) {
                        <a [href]="d.tracking_url" target="_blank" class="track-link">Track Package ↗</a>
                      }
                    </div>
                  }

                  @if (loadingHistory()) {
                    <div class="history-loading"><span class="spinner-sm"></span> Loading history…</div>
                  } @else if (statusHistory().length) {
                    <div class="status-tl">
                      @for (entry of statusHistory(); track entry.id; let last = $last) {
                        <div class="stl-row">
                          <div class="stl-aside">
                            <div class="stl-dot" [style.background]="entry.status_color || '#B87333'"></div>
                            @if (!last) { <div class="stl-line"></div> }
                          </div>
                          <div class="stl-body">
                            <div class="stl-head">
                              <div class="stl-name" [style.color]="entry.status_color || '#B87333'">
                                {{ entry.status_name || entry.status }}
                              </div>
                              <div class="stl-actions">
                                <button (click)="openEditHistoryModal(entry)" class="icon-btn icon-btn--edit" title="Edit entry">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button (click)="deleteHistoryEntry(entry)" class="icon-btn icon-btn--delete" title="Delete entry">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                </button>
                              </div>
                            </div>
                            <div class="stl-date">{{ entry.created_at | date:'dd MMM yyyy, h:mm a' }}</div>
                            @if (entry.note) { <div class="stl-note">{{ entry.note }}</div> }
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="history-empty">No status updates yet.</div>
                  }
                </div>
              </div>

            </div>
          }

          <!-- TAB 2: BOOK SHIPMENT -->
          @if (!d.tracking_number && activeTab() === 'booking') {
            <div class="booking-container">
              <form class="booking-form" (submit)="$event.preventDefault()">
                
                <!-- Section 1: Booking Details -->
                <div class="form-section">
                  <div class="form-section-title">
                    <span class="fs-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
                    Booking Details
                  </div>
                  <div class="form-grid-2">
                    <div class="field-group">
                      <label>Pickup Address</label>
                      <div class="select-wrap">
                        <select class="form-select" [(ngModel)]="bookingForm.pickupLocation" name="pickupLocation">
                          <option value="Primary">Primary</option>
                          <option value="Warehouse 1">Warehouse 1</option>
                        </select>
                        <svg class="select-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                    </div>
                    <div class="field-group" style="justify-content: center;">
                      <label class="checkbox-label">
                        <span class="chk-box" [class.checked]="bookingForm.sameAsPickup">
                          @if (bookingForm.sameAsPickup) {
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                          }
                        </span>
                        <input type="checkbox" [(ngModel)]="bookingForm.sameAsPickup" name="sameAsPickup" class="chk-native" />
                        Same as Pickup Address (Shipper Address on Label / From Address)
                      </label>
                    </div>
                  </div>
                  
                  @if (!bookingForm.sameAsPickup) {
                    <div class="form-grid-2" style="margin-top: 1rem;">
                      <div class="field-group">
                        <label>Return Address</label>
                        <input type="text" class="form-input" [(ngModel)]="bookingForm.fromAddress" name="fromAddress" placeholder="Return Address" />
                      </div>
                      <div class="field-group">
                        <label>RTO (Return) Address</label>
                        <input type="text" class="form-input" [(ngModel)]="bookingForm.rtoAddress" name="rtoAddress" placeholder="RTO (Return) Address" />
                      </div>
                    </div>
                  }
                </div>

                <!-- Section 2: Delivery Address -->
                <div class="form-section">
                  <div class="form-section-title">
                    <span class="fs-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
                    Delivery Address
                  </div>
                  <div class="form-grid-3">
                    <div class="field-group">
                      <label>Contact Name</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.contactName" name="contactName" required />
                    </div>
                    
                    <div class="field-group">
                      <label>Mobile</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.mobile" name="mobile" required placeholder="e.g. 9876543210" />
                      <div class="field-note">Mobile must be 10 digits without any spaces or other characters and excluding starting 0 or starting +91 country code</div>
                      @if (bookingForm.mobile && !validateMobile(bookingForm.mobile)) {
                        <div class="field-error">Mobile must be exactly 10 digits.</div>
                      }
                    </div>

                    <div class="field-group">
                      <label>Alternate Mobile</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.alternateMobile" name="alternateMobile" placeholder="e.g. 9876543210" />
                      <div class="field-note">Mobile must be 10 digits without any spaces or other characters and excluding starting 0 or starting +91 country code</div>
                      @if (bookingForm.alternateMobile && !validateMobile(bookingForm.alternateMobile)) {
                        <div class="field-error">Alternate mobile must be exactly 10 digits.</div>
                      }
                    </div>
                  </div>

                  <div class="form-grid-3" style="margin-top: 1rem;">
                    <div class="field-group">
                      <label>Customer E-Mail</label>
                      <input type="email" class="form-input" [(ngModel)]="bookingForm.email" name="email" placeholder="Consignee E-Mail address (optional)" />
                    </div>
                    
                    <div class="field-group">
                      <label>Pincode</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.pincode" name="pincode" required placeholder="Pincode must 6 digits" />
                      @if (bookingForm.pincode && !validatePincode(bookingForm.pincode)) {
                        <div class="field-error">Pincode must be exactly 6 digits.</div>
                      }
                    </div>

                    <div class="field-group">
                      <label>City</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.city" name="city" required />
                    </div>
                  </div>

                  <div class="form-grid-3" style="margin-top: 1rem;">
                    <div class="field-group">
                      <label>Region / State</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.state" name="state" required />
                    </div>
                    
                    <div class="field-group">
                      <label>Street Address ({{ 128 - (bookingForm.streetAddress.length || 0) }} characters remaining)</label>
                      <textarea class="form-input" [(ngModel)]="bookingForm.streetAddress" name="streetAddress" maxlength="128" required rows="2" placeholder="Street Address"></textarea>
                    </div>

                    <div class="field-group">
                      <label>Area & Landmark ({{ 128 - (bookingForm.areaLandmark.length || 0) }} characters remaining)</label>
                      <textarea class="form-input" [(ngModel)]="bookingForm.areaLandmark" name="areaLandmark" maxlength="128" rows="2" placeholder="Area & Landmark"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Section 3: Box Details -->
                <div class="form-section">
                  <div class="form-section-title">
                    <span class="fs-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12l8.73-5.04M12 22.08V12"/></svg></span>
                    Box Details (Set Defaults)
                  </div>
                  <div class="form-grid-4">
                    <div class="field-group">
                      <label>Weight of Parcel</label>
                      <div class="input-icon-wrap input-icon-wrap--suffix">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.weight" name="weight" required min="1" />
                        <span class="input-suffix">gm</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Length of Parcel</label>
                      <div class="input-icon-wrap input-icon-wrap--suffix">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.length" name="length" required min="1" />
                        <span class="input-suffix">cm</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Breadth of Parcel</label>
                      <div class="input-icon-wrap input-icon-wrap--suffix">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.breadth" name="breadth" required min="1" />
                        <span class="input-suffix">cm</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Height of Parcel</label>
                      <div class="input-icon-wrap input-icon-wrap--suffix">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.height" name="height" required min="1" />
                        <span class="input-suffix">cm</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-grid-2" style="margin-top: 1rem;">
                    <div class="field-group">
                      <label>Volumetric Weight</label>
                      <div class="volumetric-box">
                        {{ volumetricWeight }} kg
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Section 4: Shipment Details -->
                <div class="form-section">
                  <div class="form-section-title">
                    <span class="fs-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-6-5"/><path d="M9 2h6M3 7h18M9 12h6"/></svg></span>
                    Shipment Details
                  </div>
                  <div class="form-grid-3">
                    <div class="field-group">
                      <label>Mode</label>
                      <div class="radio-group">
                        <button type="button" class="radio-btn" [class.selected]="bookingForm.mode === 'surface'" (click)="bookingForm.mode = 'surface'">Surface</button>
                        <button type="button" class="radio-btn" [class.selected]="bookingForm.mode === 'air'" (click)="bookingForm.mode = 'air'">Air</button>
                        <button type="button" class="radio-btn" [class.selected]="bookingForm.mode === 'hyperlocal'" (click)="bookingForm.mode = 'hyperlocal'">Hyperlocal</button>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Parcel Type</label>
                      <div class="radio-group">
                        <button type="button" class="radio-btn" [class.selected]="bookingForm.parcelType === 'prepaid'" (click)="bookingForm.parcelType = 'prepaid'">Prepaid</button>
                        <button type="button" class="radio-btn" [class.selected]="bookingForm.parcelType === 'cod'" (click)="bookingForm.parcelType = 'cod'">Cash on Delivery</button>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Parcel Contents</label>
                      <div class="radio-group">
                        <button type="button" class="radio-btn" [class.selected]="bookingForm.parcelContentsType === 'documents'" (click)="bookingForm.parcelContentsType = 'documents'">Documents / Papers</button>
                        <button type="button" class="radio-btn" [class.selected]="bookingForm.parcelContentsType === 'products'" (click)="bookingForm.parcelContentsType = 'products'">Products / Goods</button>
                      </div>
                    </div>
                  </div>

                  <div class="form-grid-3" style="margin-top: 1rem;">
                    <div class="field-group">
                      <label>Client Order Id</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.clientOrderId" name="clientOrderId" placeholder="Client Order Id (optional)" />
                    </div>

                    <div class="field-group">
                      <label>Invoice No</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.invoiceNo" name="invoiceNo" placeholder="Invoice No (optional)" />
                    </div>

                    <div class="field-group">
                      <label>Invoice Date</label>
                      <input type="date" class="form-input" [(ngModel)]="bookingForm.invoiceDate" name="invoiceDate" />
                    </div>
                  </div>

                  <div class="form-grid-3" style="margin-top: 1rem;">
                    <div class="field-group">
                      <label>Invoice Value ₹</label>
                      <input type="number" class="form-input" [(ngModel)]="bookingForm.invoiceValue" name="invoiceValue" />
                    </div>

                    <div class="field-group">
                      <label>Parcel Contents</label>
                      <input type="text" class="form-input" [(ngModel)]="bookingForm.parcelContents" name="parcelContents" placeholder="Parcel Contents. Example - 2 x Herbal Secrets Masal Powder 100g" />
                    </div>

                    <div class="field-group">
                      <label>Pickup Date</label>
                      <input type="date" class="form-input" [(ngModel)]="bookingForm.pickupDate" name="pickupDate" />
                    </div>
                  </div>
                </div>

                <!-- Courier Serviceability Check & rates display -->
                <div class="form-section shipment-card">
                  <div class="form-section-title">
                    <span class="fs-icon fs-icon--copper"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
                    Courier Rates &amp; Booking
                  </div>

                  <div class="fetch-row">
                    <button type="button" class="btn-primary" (click)="loadCouriersForForm()" [disabled]="loadingCouriers() || !isFormValid()">
                      @if (loadingCouriers()) { <span class="btn-spinner"></span> }
                      @if (!loadingCouriers()) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 21l-4.35-4.35"/><circle cx="10" cy="10" r="7"/></svg>
                      }
                      {{ loadingCouriers() ? 'Checking Serviceability...' : 'Fetch Serviceable Couriers' }}
                    </button>
                    @if (!isFormValid()) {
                      <span class="field-error" style="margin: 0;">Please fill out and correct all required validation fields.</span>
                    }
                  </div>

                  @if (loadingCouriers()) {
                    <div class="couriers-loading">
                      <span class="spinner-sm"></span> Fetching courier rates...
                    </div>
                  } @else if (couriersError()) {
                    <div class="error-msg">{{ couriersError() }}</div>
                  } @else if (shiprocketCouriers().length > 0) {
                    <div class="couriers-list">
                      @for (c of shiprocketCouriers(); track c.courier_company_id) {
                        <div class="courier-card" (click)="selectCourier(c)">
                          <div class="courier-left">
                            <span class="courier-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
                            <div>
                              <div class="courier-name">{{ c.courier_name }}</div>
                              <div class="courier-meta">
                                <span>ETD: <strong>{{ c.etd }}</strong></span>
                                <span class="star-meta">★ {{ c.rating }}</span>
                                <span class="cod-tag" [class.cod-yes]="c.cod">{{ c.cod ? 'COD' : 'Prepaid' }}</span>
                              </div>
                            </div>
                          </div>
                          <div class="courier-right">
                            <div class="courier-rate">{{ c.rate | inr }}</div>
                            <button class="btn-book-sm"
                              [disabled]="bookingCourierId() !== null"
                              (click)="bookShipment(c); $event.stopPropagation()">
                              {{ bookingCourierId() === c.courier_company_id ? 'Booking...' : 'Book' }}
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="muted" style="font-size:0.8rem;padding:0.5rem 0">No serviceable couriers loaded. Click "Fetch Serviceable Couriers" to search.</div>
                  }

                  @if (bookSuccessMsg()) {
                    <div class="success-msg">✓ {{ bookSuccessMsg() }}</div>
                  }
                  @if (trackError()) {
                    <div class="error-msg" style="margin-top:0.75rem">{{ trackError() }}</div>
                  }
                </div>
              </form>
            </div>
          }

        </div>
      }
    </div>

    <!-- Update Status Modal -->
    @if (showUpdateModal()) {
      <div class="modal-backdrop" (click)="closeUpdateModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <span class="modal-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>
              Update Order Status
            </h2>
            <button class="modal-close" (click)="closeUpdateModal()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Status *</label>
              <div class="select-wrap">
                <select [(ngModel)]="updateForm.status" class="form-select">
                  @for (st of allStatuses(); track st.id) {
                    <option [value]="st.slug">{{ st.name }}</option>
                  }
                </select>
                <svg class="select-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Date &amp; Time</label>
              <input type="datetime-local" [(ngModel)]="updateForm.date" class="form-input" />
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Remark <span class="field-optional">(optional)</span></label>
              <textarea [(ngModel)]="updateForm.note" class="form-input" rows="3" placeholder="Add a note about this status change…"></textarea>
            </div>
            @if (updateError()) { <div class="error-msg" style="margin-top:0.75rem">{{ updateError() }}</div> }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeUpdateModal()">Cancel</button>
            <button class="btn-primary" (click)="saveStatusUpdate()" [disabled]="updatingStatus()">
              @if (updatingStatus()) { <span class="btn-spinner"></span> }
              {{ updatingStatus() ? 'Updating…' : 'Update Status' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Manual Tracking Modal -->
    @if (trackingOrder()) {
      <div class="modal-backdrop" (click)="closeTracking()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <span class="modal-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg></span>
              {{ trackingOrder()?.tracking_number ? 'Update Tracking' : 'Manual Tracking Entry' }} — {{ trackingOrder()!.order_number }}
            </h2>
            <button class="modal-close" (click)="closeTracking()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal-body">
            @if (trackingOrder()?.tracking_number) {
              <div class="active-shipment-card">
                <div class="asc-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Active Shipment
                </div>
                <div class="dc-val">AWB: <strong>{{ trackingOrder()?.tracking_number }}</strong></div>
                @if (trackingOrder()?.tracking_url) {
                  <a [href]="trackingOrder()?.tracking_url" target="_blank" class="track-link">Track ↗</a>
                }
              </div>
            }
            <div class="field">
              <label>Tracking Number</label>
              <input type="text" [(ngModel)]="trackingNum" class="form-input" placeholder="e.g. DTDC1234567890" />
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Tracking URL</label>
              <input type="text" [(ngModel)]="trackingUrl" class="form-input" placeholder="https://dtdc.com/track/..." />
            </div>
            @if (trackError()) { <div class="error-msg" style="margin-top:1rem">{{ trackError() }}</div> }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeTracking()">Cancel</button>
            <button class="btn-primary" (click)="saveTracking()" [disabled]="trackSaving()">
              @if (trackSaving()) { <span class="btn-spinner"></span> }
              {{ trackSaving() ? 'Saving...' : 'Save Tracking' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Edit Status History Modal -->
    @if (showEditHistoryModal()) {
      <div class="modal-backdrop" (click)="closeEditHistoryModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <span class="modal-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
              Edit Status History Entry
            </h2>
            <button class="modal-close" (click)="closeEditHistoryModal()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Status *</label>
              <div class="select-wrap">
                <select [(ngModel)]="editHistoryForm.status" class="form-select">
                  @for (st of allStatuses(); track st.id) {
                    <option [value]="st.slug">{{ st.name }}</option>
                  }
                </select>
                <svg class="select-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Date &amp; Time</label>
              <input type="datetime-local" [(ngModel)]="editHistoryForm.date" class="form-input" />
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Remark <span class="field-optional">(optional)</span></label>
              <textarea [(ngModel)]="editHistoryForm.note" class="form-input" rows="3" placeholder="Add a note about this status change…"></textarea>
            </div>
            @if (editHistoryError()) { <div class="error-msg" style="margin-top:0.75rem">{{ editHistoryError() }}</div> }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeEditHistoryModal()">Cancel</button>
            <button class="btn-primary" (click)="saveHistoryUpdate()" [disabled]="updatingHistory()">
              @if (updatingHistory()) { <span class="btn-spinner"></span> }
              {{ updatingHistory() ? 'Updating…' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 1.5rem 1.75rem; max-width: 100%; width: 100%; box-sizing: border-box; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .btn-back { display: inline-flex; align-items: center; gap: 6px; color: #B87333; text-decoration: none; font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.6rem; transition: color 0.15s; }
    .btn-back:hover { color: #9d5d22; }
    .order-title { font-size: 1.375rem; font-weight: 700; color: #1c1c1c; margin: 0; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
    .order-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
    .order-date { font-size: 0.75rem; font-weight: 600; color: #888; background: #F3EFE8; padding: 3px 10px; border-radius: 12px; }
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .status-selector { display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end; }
    .status-select-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #AAAAAA; letter-spacing: 0.06em; }
    .status-select-wrap { display: flex; align-items: center; gap: 0.6rem; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid transparent; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .select-wrap { position: relative; display: inline-flex; align-items: center; }
    .select-wrap--header { min-width: 150px; }
    .form-select { appearance: none; -webkit-appearance: none; width: 100%; padding: 0.5rem 1.9rem 0.5rem 0.75rem; background: #fff; border: 1.5px solid #E0D8C8; border-radius: 8px; font-size: 0.8125rem; color: #1c1c1c; outline: none; cursor: pointer; transition: all 0.15s ease; font-weight: 600; }
    .form-select:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184, 115, 51, 0.1); }
    .form-select:disabled { opacity: 0.6; cursor: not-allowed; }
    .select-caret { position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%); color: #AAAAAA; pointer-events: none; }

    .detail-loading { padding: 5rem 1rem; text-align: center; color: #888; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; font-size: 0.85rem; }
    .spinner-lg { display: inline-block; width: 26px; height: 26px; border: 3px solid rgba(184,115,51,0.15); border-top-color: #B87333; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .detail-body { display: flex; flex-direction: column; gap: 1.25rem; }

    /* 4-column layout */
    .detail-row-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    @media (max-width: 1024px) { .detail-row-4 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .detail-row-4 { grid-template-columns: 1fr; } }

    .detail-card { background: #fff; border: 1px solid #E0D8C8; border-radius: 12px; padding: 1.1rem; }
    .shipment-card { background: #fff; border-color: rgba(184,115,51,0.3); }
    .dc-title { display: flex; align-items: center; gap: 6px; font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #AAAAAA; margin-bottom: 0.65rem; }
    .dc-icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; }
    .dc-icon--blue { background: rgba(29,78,216,0.1); color: #1D4ED8; }
    .dc-icon--purple { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .dc-icon--green { background: rgba(21,128,61,0.1); color: #15803D; }
    .dc-icon--amber { background: rgba(180,83,9,0.1); color: #B45309; }
    .dc-icon--copper { background: rgba(184,115,51,0.1); color: #B87333; }
    .dc-val { font-size: 0.8125rem; color: #555; margin-top: 2px; line-height: 1.4; }
    .dc-val.muted { color: #AAAAAA; font-style: italic; }
    .fw { font-weight: 600; color: #1C1C1C !important; }

    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; background: #F3EFE8; color: #888; }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .pay-paid { background: rgba(21,128,61,0.09); color: #15803D; }
    .pay-pending { background: rgba(180,83,9,0.1); color: #B45309; }
    .pay-failed { background: rgba(220,38,38,0.09); color: #DC2626; }

    .count-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: rgba(184,115,51,0.1); color: #B87333; font-size: 0.65rem; font-weight: 700; }

    /* Compact Items table */
    .items-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-top: 0.25rem; }
    .items-table th { text-align: left; padding: 0.5rem 0.5rem; font-size: 0.63rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #AAAAAA; border-bottom: 1px solid #E0D8C8; }
    .items-table td { padding: 0.55rem 0.5rem; border-bottom: 1px solid #F3EFE8; vertical-align: middle; }
    .items-table tr:last-child td { border-bottom: none; }
    .item-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 7px; border: 1px solid #E0D8C8; }
    .item-thumb-empty { width: 36px; height: 36px; background: #F3EFE8; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: #C9BEA8; }
    .item-name { font-weight: 600; color: #1C1C1C; font-size: 0.82rem; }
    .item-variant { font-size: 0.72rem; color: #888; margin-top: 1px; }

    /* Summary */
    .summary-card { font-size: 0.8125rem; }
    .summary-row { display: flex; justify-content: space-between; padding: 0.32rem 0; color: #555; border-bottom: 1px solid #F3EFE8; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row.green { color: #15803D; }
    .summary-row.total { font-weight: 700; color: #1C1C1C; font-size: 0.9rem; border-top: 1.5px solid #E0D8C8; padding-top: 0.55rem; margin-top: 0.3rem; border-bottom: none; }

    .track-link { font-size: 0.75rem; color: #B87333; font-weight: 600; text-decoration: underline; display: inline-block; margin-top: 0.25rem; }

    /* Layout structure */
    .detail-main-layout { display: grid; grid-template-columns: 7fr 3fr; gap: 1.25rem; align-items: start; }
    @media (max-width: 1024px) { .detail-main-layout { grid-template-columns: 1fr; } }
    .main-left { display: flex; flex-direction: column; gap: 1.25rem; }
    .main-right { display: flex; flex-direction: column; gap: 1.25rem; }
    .bottom-actions { display: flex; gap: 0.75rem; }

    /* Order History Timeline */
    .dc-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; }
    .btn-update-sm { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; background: #B87333; color: #fff; border: none; border-radius: 7px; font-size: 0.72rem; font-weight: 700; cursor: pointer; flex-shrink: 0; transition: opacity 0.15s; }
    .btn-update-sm:hover { opacity: 0.88; }
    .history-loading { font-size: 0.75rem; color: #888; padding: 0.5rem 0; display: flex; align-items: center; gap: 6px; }
    .history-empty { font-size: 0.75rem; color: #AAA; font-style: italic; padding: 0.5rem 0; }
    .awb-strip { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem; background: #F3EFE8; border-radius: 8px; padding: 0.5rem 0.7rem; margin-bottom: 0.85rem; }
    .status-tl { display: flex; flex-direction: column; padding-top: 0.25rem; }
    .stl-row { display: flex; gap: 0.7rem; }
    .stl-aside { display: flex; flex-direction: column; align-items: center; }
    .stl-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; box-shadow: 0 0 0 3px #fff; }
    .stl-line { flex: 1; width: 2px; background: #E0D8C8; margin: 4px 0; min-height: 14px; }
    .stl-body { padding-bottom: 1rem; flex: 1; min-width: 0; }
    .stl-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
    .stl-name { font-size: 0.8rem; font-weight: 700; }
    .stl-actions { display: flex; gap: 0.35rem; margin-top: -2px; flex-shrink: 0; }
    .stl-date { font-size: 0.65rem; color: #AAAAAA; margin-top: 3px; font-weight: 600; }
    .stl-note { font-size: 0.72rem; color: #555; background: #FAF8F5; border-left: 2px solid #E0D8C8; border-radius: 0 6px 6px 0; padding: 5px 9px; margin-top: 6px; font-style: italic; }

    .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; transition: all 0.15s ease; flex-shrink: 0; }
    .icon-btn--edit { background: rgba(184,115,51,0.08); color: #B87333; }
    .icon-btn--edit:hover { background: rgba(184,115,51,0.16); }
    .icon-btn--delete { background: #fff; color: #DC2626; border-color: rgba(220,38,38,0.25); }
    .icon-btn--delete:hover { background: rgba(220,38,38,0.06); }

    /* Tabs */
    .tabs-container { display: flex; gap: 0.5rem; border-bottom: 1.5px solid #E0D8C8; margin-bottom: 0.25rem; }
    .tab-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.6rem 1.1rem; background: none; border: none; border-bottom: 2px solid transparent; font-size: 0.85rem; font-weight: 600; color: #888; cursor: pointer; margin-bottom: -1.5px; transition: all 0.15s; }
    .tab-btn:hover { color: #B87333; }
    .tab-btn.active { color: #B87333; border-bottom-color: #B87333; }

    /* Booking Form Layout */
    .booking-container { background: #FAF8F5; border: 1px solid #E0D8C8; border-radius: 12px; padding: 1.25rem; }
    .booking-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-section { border: 1px solid #E0D8C8; border-radius: 12px; padding: 1.25rem; background: #fff; }
    .form-section-title { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; color: #1C1C1C; margin-bottom: 1.1rem; padding-bottom: 0.65rem; border-bottom: 1px solid #F3EFE8; text-transform: uppercase; letter-spacing: 0.05em; }
    .fs-icon { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 7px; background: #F3EFE8; color: #B87333; flex-shrink: 0; }
    .fs-icon--copper { background: rgba(184,115,51,0.12); }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    .form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    @media (max-width: 768px) {
      .form-grid-2, .form-grid-3, .form-grid-4 { grid-template-columns: 1fr; }
    }

    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-group label { font-size: 0.7rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.03em; }
    .field-note { font-size: 0.65rem; color: #AAAAAA; line-height: 1.3; }
    .field-error { font-size: 0.7rem; color: #DC2626; font-weight: 600; }
    .field-optional { font-weight: 400; color: #AAAAAA; text-transform: none; letter-spacing: 0; }

    .input-icon-wrap { position: relative; display: flex; align-items: center; }
    .input-icon-wrap--suffix .form-input { padding-right: 2.6rem; }
    .input-suffix { position: absolute; right: 0.7rem; font-size: 0.7rem; color: #888; font-weight: 700; pointer-events: none; }
    .volumetric-box { padding: 0.55rem 0.8rem; background: #F3EFE8; border: 1px solid #E0D8C8; border-radius: 8px; font-size: 0.875rem; font-weight: 700; color: #B87333; }

    .radio-group { display: flex; gap: 0.4rem; width: 100%; }
    .radio-btn { flex: 1; padding: 0.45rem 0.5rem; text-align: center; border: 1.5px solid #E0D8C8; border-radius: 8px; cursor: pointer; font-size: 0.75rem; font-weight: 600; color: #555; background: #FAF8F5; transition: all 0.15s; outline: none; }
    .radio-btn:hover { border-color: #B87333; }
    .radio-btn.selected { border-color: #B87333; background: rgba(184,115,51,0.08); color: #B87333; }
    .checkbox-label { display: flex; align-items: center; gap: 0.55rem; font-size: 0.8rem; color: #555; cursor: pointer; font-weight: 600; }
    .chk-box { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #E0D8C8; background: #fff; flex-shrink: 0; transition: all 0.15s ease; }
    .chk-box.checked { background: #B87333; border-color: #B87333; }
    .chk-native { position: absolute; opacity: 0; width: 18px; height: 18px; margin: 0; cursor: pointer; }

    /* Shiprocket rates */
    .fetch-row { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .couriers-loading { font-size: 0.8rem; color: #888; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; }
    .couriers-list { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.75rem; }
    .courier-card { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0.9rem; border: 1.5px solid #E0D8C8; border-radius: 10px; cursor: pointer; background: #FAF8F5; transition: all 0.15s; }
    .courier-card:hover { border-color: #B87333; background: #fff; box-shadow: 0 2px 8px rgba(184,115,51,0.08); }
    .courier-left { display: flex; align-items: center; gap: 0.75rem; }
    .courier-icon { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 9px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
    .courier-name { font-weight: 700; color: #1C1C1C; font-size: 0.85rem; }
    .courier-meta { font-size: 0.72rem; color: #888; margin-top: 2px; display: flex; gap: 0.75rem; align-items: center; }
    .star-meta { color: #B45309; font-weight: 600; }
    .cod-tag { padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; background: rgba(220,38,38,0.08); color: #DC2626; }
    .cod-tag.cod-yes { background: rgba(21,128,61,0.08); color: #15803D; }
    .courier-right { text-align: right; }
    .courier-rate { font-weight: 700; color: #B87333; font-size: 0.95rem; }
    .btn-book-sm { padding: 4px 12px; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer; margin-top: 0.3rem; transition: background 0.15s; }
    .btn-book-sm:hover:not(:disabled) { background: #9d5d22; }
    .btn-book-sm:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal { background: #fff; border: 1px solid #E0D8C8; border-radius: 14px; width: 100%; max-width: 520px; box-shadow: 0 8px 40px rgba(0,0,0,0.14); }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.1rem 1.25rem; border-bottom: 1px solid #F3EFE8; }
    .modal-header h2 { font-size: 0.95rem; font-weight: 700; color: #1C1C1C; margin: 0; display: flex; align-items: center; gap: 8px; }
    .modal-icon { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 7px; background: rgba(184,115,51,0.1); color: #B87333; flex-shrink: 0; }
    .modal-close { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: none; border: none; color: #888; cursor: pointer; border-radius: 7px; transition: all 0.15s; flex-shrink: 0; }
    .modal-close:hover { color: #1C1C1C; background: #F3EFE8; }
    .modal-body { padding: 1.25rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 0.85rem 1.25rem; border-top: 1px solid #F3EFE8; }

    .active-shipment-card { padding: 0.85rem; border: 1.5px solid rgba(21,128,61,0.3); border-radius: 10px; background: rgba(21,128,61,0.05); margin-bottom: 1rem; }
    .asc-title { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #15803D; font-size: 0.85rem; margin-bottom: 4px; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #888; }
    .form-input { padding: 0.5rem 0.7rem; background: #fff; border: 1px solid #E0D8C8; border-radius: 8px; color: #1C1C1C; font-size: 0.8125rem; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.15s; }
    .form-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-input::placeholder { color: #AAAAAA; }

    .error-msg { color: #DC2626; padding: 0.65rem 0.75rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.18); border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; }
    .error-msg button { background: none; border: 1px solid #DC2626; color: #DC2626; padding: 3px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; margin-left: 0.5rem; font-weight: 600; }
    .success-msg { color: #15803D; padding: 0.65rem 0.75rem; background: rgba(21,128,61,0.06); border: 1px solid rgba(21,128,61,0.2); border-radius: 8px; margin-top: 0.75rem; font-size: 0.8125rem; font-weight: 600; }
    .btn-secondary { display: inline-flex; align-items: center; gap: 6px; padding: 0.5rem 1.1rem; background: #fff; border: 1px solid #E0D8C8; color: #555; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .btn-secondary:hover { background: #FAF8F5; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 0.5rem 1.3rem; background: #B87333; color: #fff; border: none; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .spinner-sm { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(184,115,51,0.2); border-top-color: #B87333; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .btn-spinner { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-cell { text-align: center; color: #AAAAAA; padding: 2rem; font-style: italic; }

    .muted-small { font-size: 0.72rem; color: #888; font-style: italic; padding: 1rem 0; text-align: center; }
  `]
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly confirmSvc = inject(AdminConfirmService);
  private readonly toast = inject(AdminToastService);
  readonly imgUrl = imageUrl;

  orderId = signal<number | null>(null);
  detailOrder = signal<OrderDetail | null>(null);
  loadingDetail = signal(false);
  error = signal('');

  // Status management signals
  allStatuses = signal<any[]>([]);
  updatingStatus = signal(false);

  // Active tab selection (overview vs custom shipment booking)
  activeTab = signal<'overview' | 'booking'>('overview');

  // Booking Form State
  bookingForm = {
    pickupLocation: 'Primary',
    sameAsPickup: true,
    fromAddress: '',
    returnAddress: '',
    rtoAddress: '',

    contactName: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    streetAddress: '',
    areaLandmark: '',
    pincode: '',
    city: '',
    state: '',

    weight: 500,
    length: 10,
    breadth: 10,
    height: 10,

    mode: 'surface',
    parcelType: 'prepaid',
    parcelContentsType: 'products',
    clientOrderId: '',
    invoiceNo: '',
    invoiceDate: '',
    invoiceValue: 0,
    parcelContents: '',
    pickupDate: ''
  };

  // Status history
  statusHistory = signal<any[]>([]);
  loadingHistory = signal(false);

  // Edit status history entry
  showEditHistoryModal = signal(false);
  editHistoryError = signal('');
  updatingHistory = signal(false);
  selectedHistoryId = signal<number | null>(null);
  editHistoryForm = { status: '', date: '', note: '' };

  // Update status modal
  showUpdateModal = signal(false);
  updateError = signal('');
  updateForm: { status: string; date: string; note: string } = { status: '', date: '', note: '' };

  // Tracking modal (manual)
  trackingOrder = signal<Order | null>(null);
  trackingNum = '';
  trackingUrl = '';
  trackSaving = signal(false);
  trackError = signal('');

  // Couriers in detail page
  shiprocketCouriers = signal<any[]>([]);
  loadingCouriers = signal(false);
  couriersError = signal('');
  bookingCourierId = signal<number | null>(null);
  bookSuccessMsg = signal('');

  readonly stars = [1, 2, 3, 4, 5];

  readonly shippingAddr = computed<ShippingAddress | null>(() => {
    const d = this.detailOrder();
    if (!d) return null;
    try {
      const raw = d.shipping_address;
      return typeof raw === 'string' ? JSON.parse(raw) : (raw as ShippingAddress);
    } catch { return null; }
  });


  ngOnInit(): void {
    this.loadAllStatuses();
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = Number(idStr);
        this.orderId.set(id);
        this.loadDetail(id);
      }
    });
  }

  retryLoad(): void {
    const id = this.orderId();
    if (id) this.loadDetail(id);
  }

  loadDetail(id: number): void {
    this.loadingDetail.set(true);
    this.error.set('');
    this.shiprocketCouriers.set([]);
    this.couriersError.set('');
    this.bookSuccessMsg.set('');

    this.api.get<any>(`/orders/${id}`).subscribe({
      next: (res) => {
        const d = res.data;
        this.detailOrder.set(d);
        this.loadingDetail.set(false);
        this.loadHistory(id);
        if (!d.tracking_number) {
          this.initializeBookingForm(d);
          this.loadCouriersForForm();
        }
      },
      error: (err) => {
        this.error.set(err.userMessage || 'Failed to load order details');
        this.loadingDetail.set(false);
      }
    });
  }

  cleanMobile(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(-10);
    }
    return cleaned;
  }

  validateMobile(val: string): boolean {
    return /^\d{10}$/.test(val);
  }

  validatePincode(val: string): boolean {
    return /^\d{6}$/.test(val);
  }

  isFormValid(): boolean {
    const f = this.bookingForm;
    if (!f.contactName || !f.streetAddress || !f.pincode || !f.city || !f.state) return false;
    if (!/^\d{10}$/.test(f.mobile)) return false;
    if (f.alternateMobile && !/^\d{10}$/.test(f.alternateMobile)) return false;
    if (!/^\d{6}$/.test(f.pincode)) return false;
    if (f.streetAddress.length > 128 || (f.areaLandmark && f.areaLandmark.length > 128)) return false;
    return true;
  }

  get volumetricWeight(): number {
    const vol = (this.bookingForm.length * this.bookingForm.breadth * this.bookingForm.height) / 5000;
    return parseFloat(vol.toFixed(3));
  }

  initializeBookingForm(d: OrderDetail): void {
    const addr = this.shippingAddr();
    const itemsText = (d.items || [])
      .map(item => `${item.quantity} x ${item.product_name}${item.variant_name ? ' (' + item.variant_name + ')' : ''}`)
      .join(', ');

    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    this.bookingForm = {
      pickupLocation: 'Primary',
      sameAsPickup: true,
      fromAddress: '',
      returnAddress: '',
      rtoAddress: '',

      contactName: addr?.full_name || `${d.first_name} ${d.last_name}`.trim(),
      mobile: this.cleanMobile(addr?.phone || d.phone || d.user_phone || ''),
      alternateMobile: '',
      email: d.email || '',
      streetAddress: (addr?.address_line1 || '').substring(0, 128),
      areaLandmark: (addr?.address_line2 || '').substring(0, 128),
      pincode: addr?.pincode || '',
      city: addr?.city || '',
      state: addr?.state || '',

      weight: 500,
      length: 10,
      breadth: 10,
      height: 10,

      mode: 'surface',
      parcelType: d.payment_method === 'cod' ? 'cod' : 'prepaid',
      parcelContentsType: 'products',
      clientOrderId: d.order_number || '',
      invoiceNo: d.order_number || '',
      invoiceDate: formattedToday,
      invoiceValue: Number(d.total_amount) || 0,
      parcelContents: itemsText.substring(0, 100),
      pickupDate: formattedToday
    };
  }

  formatStatus(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatPaymentMethod(m: string): string {
    const map: Record<string, string> = {
      cod: 'Cash on Delivery', razorpay: 'Online (Razorpay)',
      partial: 'Partial (Advance)', hybrid: 'Customer Choice'
    };
    return map[m] || m;
  }

  loadCouriersForForm(): void {
    const d = this.detailOrder();
    if (!d) return;

    this.loadingCouriers.set(true);
    this.couriersError.set('');
    this.shiprocketCouriers.set([]);

    const params: Record<string, string> = {
      pincode: this.bookingForm.pincode,
      weight: this.bookingForm.weight.toString(),
      cod: (this.bookingForm.parcelType === 'cod').toString(),
      declared_value: this.bookingForm.invoiceValue.toString(),
      length: this.bookingForm.length.toString(),
      breadth: this.bookingForm.breadth.toString(),
      height: this.bookingForm.height.toString(),
      mode: this.bookingForm.mode
    };

    const queryStr = Object.entries(params)
      .filter(([_, val]) => val !== undefined && val !== null && val !== '')
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');

    this.api.get<any>(`/orders/${d.id}/couriers?${queryStr}`).subscribe({
      next: (res) => {
        this.shiprocketCouriers.set(res.data || []);
        this.loadingCouriers.set(false);
      },
      error: (err) => {
        this.couriersError.set(err.error?.message || 'Failed to load courier rates');
        this.loadingCouriers.set(false);
      }
    });
  }


  loadHistory(orderId: number): void {
    this.loadingHistory.set(true);
    this.api.get<any>(`/orders/${orderId}/status-history`).subscribe({
      next: (res: any) => { this.statusHistory.set(res.data || []); this.loadingHistory.set(false); },
      error: () => this.loadingHistory.set(false)
    });
  }

  openEditHistoryModal(entry: any): void {
    this.selectedHistoryId.set(entry.id);
    const date = new Date(entry.created_at);
    const pad = (n: number) => String(n).padStart(2, '0');
    // For input type="datetime-local", we need YYYY-MM-DDTHH:MM format
    const local = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    this.editHistoryForm = {
      status: entry.status,
      date: local,
      note: entry.note || ''
    };
    this.editHistoryError.set('');
    this.showEditHistoryModal.set(true);
  }

  closeEditHistoryModal(): void {
    this.showEditHistoryModal.set(false);
    this.selectedHistoryId.set(null);
  }

  saveHistoryUpdate(): void {
    const id = this.selectedHistoryId();
    if (!id) return;
    this.updatingHistory.set(true);
    this.editHistoryError.set('');
    this.api.patch<any>(`/orders/status-history/${id}`, {
      status: this.editHistoryForm.status,
      date: this.editHistoryForm.date || null,
      note: this.editHistoryForm.note || null
    }).subscribe({
      next: () => {
        this.updatingHistory.set(false);
        this.showEditHistoryModal.set(false);
        this.selectedHistoryId.set(null);
        const orderId = this.orderId();
        if (orderId) this.loadDetail(orderId);
      },
      error: (err: any) => {
        this.updatingHistory.set(false);
        this.editHistoryError.set(err.userMessage || 'Update failed');
      }
    });
  }

  async deleteHistoryEntry(entry: any): Promise<void> {
    const ok = await this.confirmSvc.confirm({
      title: 'Delete History Entry',
      message: 'Are you sure you want to delete this status history entry?',
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    this.api.delete<any>(`/orders/status-history/${entry.id}`).subscribe({
      next: () => {
        const orderId = this.orderId();
        if (orderId) this.loadDetail(orderId);
        this.toast.success('History entry deleted');
      },
      error: (err: any) => {
        this.toast.error(err.userMessage || 'Delete failed');
      }
    });
  }

  openUpdateModal(): void {
    const d = this.detailOrder();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    this.updateForm = { status: d?.status || '', date: local, note: '' };
    this.updateError.set('');
    this.showUpdateModal.set(true);
  }

  closeUpdateModal(): void { this.showUpdateModal.set(false); }

  saveStatusUpdate(): void {
    if (!this.updateForm.status) { this.updateError.set('Please select a status'); return; }
    const d = this.detailOrder();
    if (!d) return;
    this.updatingStatus.set(true);
    this.updateError.set('');
    this.api.patch<any>(`/orders/${d.id}/status`, {
      status: this.updateForm.status,
      date: this.updateForm.date || null,
      note: this.updateForm.note || null
    }).subscribe({
      next: () => {
        this.updatingStatus.set(false);
        this.showUpdateModal.set(false);
        this.loadDetail(d.id);
      },
      error: (err: any) => { this.updatingStatus.set(false); this.updateError.set(err.userMessage || 'Update failed'); }
    });
  }

  selectCourier(_c: any): void {
    // placeholder for courier selection highlight
  }

  bookShipment(c: any): void {
    const d = this.detailOrder();
    if (!d) return;
    this.bookingCourierId.set(c.courier_company_id);
    this.trackError.set('');
    this.bookSuccessMsg.set('');

    const payload = {
      courier_company_id: c.courier_company_id,
      courier_name: c.courier_name,
      rate: c.rate,

      // Custom booking details
      pickup_location: this.bookingForm.pickupLocation,
      same_as_pickup: this.bookingForm.sameAsPickup,
      from_address: this.bookingForm.fromAddress,
      return_address: this.bookingForm.returnAddress,
      rto_address: this.bookingForm.rtoAddress,

      // Delivery Address details
      billing_customer_name: this.bookingForm.contactName,
      billing_phone: this.bookingForm.mobile,
      billing_alt_phone: this.bookingForm.alternateMobile,
      billing_email: this.bookingForm.email,
      billing_address: this.bookingForm.streetAddress,
      billing_address_2: this.bookingForm.areaLandmark,
      billing_pincode: this.bookingForm.pincode,
      billing_city: this.bookingForm.city,
      billing_state: this.bookingForm.state,

      // Box details
      weight: this.bookingForm.weight,
      length: this.bookingForm.length,
      breadth: this.bookingForm.breadth,
      height: this.bookingForm.height,

      // Shipment Details overrides
      payment_method: this.bookingForm.parcelType === 'cod' ? 'COD' : 'Prepaid',
      client_order_id: this.bookingForm.clientOrderId,
      invoice_no: this.bookingForm.invoiceNo,
      invoice_date: this.bookingForm.invoiceDate,
      invoice_value: this.bookingForm.invoiceValue,
      order_items_text: this.bookingForm.parcelContents,
      pickup_date: this.bookingForm.pickupDate
    };

    this.api.post<any>(`/orders/${d.id}/book-shipment`, payload).subscribe({
      next: (res) => {
        this.bookingCourierId.set(null);
        const awb = res.data?.tracking_number || '';
        this.bookSuccessMsg.set(`Shipment booked! AWB: ${awb}`);
        this.detailOrder.update(o => o ? { ...o, tracking_number: awb, tracking_url: res.data?.tracking_url || null, status: 'shipped' } : o);
        setTimeout(() => {
          this.shiprocketCouriers.set([]);
          this.loadDetail(d.id);
        }, 1500);
      },
      error: (err) => {
        this.bookingCourierId.set(null);
        this.trackError.set(err.error?.message || 'Booking failed');
      }
    });
  }

  // Manual tracking modal
  openTracking(o: Order): void {
    this.trackingOrder.set(o);
    this.trackingNum = o.tracking_number || '';
    this.trackingUrl = o.tracking_url || '';
    this.trackError.set('');
  }

  closeTracking(): void { this.trackingOrder.set(null); }

  saveTracking(): void {
    const o = this.trackingOrder();
    if (!o) return;
    this.trackSaving.set(true);
    this.trackError.set('');
    this.api.patch<any>(`/orders/${o.id}/tracking`, { tracking_number: this.trackingNum, tracking_url: this.trackingUrl }).subscribe({
      next: () => {
        o.tracking_number = this.trackingNum;
        o.tracking_url = this.trackingUrl;
        this.trackSaving.set(false);
        this.trackingOrder.set(null);
        this.loadDetail(o.id);
      },
      error: (err) => { this.trackSaving.set(false); this.trackError.set(err.userMessage || 'Update failed'); }
    });
  }


  loadAllStatuses(): void {
    this.api.get<any>('/admin/order-statuses').subscribe({
      next: (res) => this.allStatuses.set(res.data || []),
      error: (err) => console.error('Failed to load order statuses', err)
    });
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    const d = this.detailOrder();
    if (!d || !newStatus || newStatus === d.status) return;

    this.updatingStatus.set(true);
    this.api.patch<any>(`/orders/${d.id}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.updatingStatus.set(false);
        this.toast.success('Order status updated');
        this.loadDetail(d.id);
      },
      error: (err) => {
        this.updatingStatus.set(false);
        this.toast.error(err.userMessage || 'Failed to update order status');
        select.value = d.status;
      }
    });
  }
}
