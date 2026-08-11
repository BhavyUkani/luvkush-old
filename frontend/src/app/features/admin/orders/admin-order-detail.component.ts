import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';
import { AdminConfirmService } from '../shared/admin-confirm.service';
import { AdminToastService } from '../shared/admin-toast.service';

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
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      @if (loadingDetail()) {
        <div class="detail-loading">Loading order details...</div>
      } @else if (error()) {
        <div class="error-msg">{{ error() }} <button (click)="retryLoad()">Retry</button></div>
      } @else if (detailOrder(); as d) {
        <div class="page-header" style="padding: 0; margin-bottom: 1.5rem;">
          <div>
            <a routerLink="/admin/orders" class="btn-back">← Back to Orders</a>
            <h1 class="order-title">
              Order {{ d.order_number }}
              <span class="order-date">{{ d.created_at | date:'dd MMM yyyy, hh:mm a' }}</span>
            </h1>
          </div>
          <div class="header-actions">
            <div class="status-selector">
              <label class="status-select-label">Order Status</label>
              <div class="status-select-wrap">
                <select [value]="d.status" (change)="onStatusChange($event)" [disabled]="updatingStatus()" class="status-dropdown">
                  @for (st of allStatuses(); track st.id) {
                    <option [value]="st.slug">{{ st.name }}</option>
                  }
                </select>
                <span class="status-badge" [style.background-color]="d.status_color + '15'" [style.color]="d.status_color" [style.border-color]="d.status_color + '40'">
                  {{ d.status_name || formatStatus(d.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-body">
          
          <!-- Row 1: 4 Cards (Customer, Shipping Address, Payments, Order Summary) -->
          <div class="detail-row-4">
            
            <!-- Card 1: Customer -->
            <div class="detail-card">
              <div class="dc-title">Customer</div>
              <div class="dc-val fw">{{ d.first_name }} {{ d.last_name }}</div>
              <div class="dc-val">{{ d.email }}</div>
              <div class="dc-val">{{ d.user_phone || d.phone || '—' }}</div>
            </div>

            <!-- Card 2: Shipping Address -->
            <div class="detail-card">
              <div class="dc-title">Shipping Address</div>
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
              <div class="dc-title">Payment</div>
              <div class="dc-val fw">{{ d.advance_paid_amount ? 'Partial (Advance)' : formatPaymentMethod(d.payment_method) }}</div>
              <div style="margin-top: 0.5rem;">
                <span class="badge" [class]="'pay-' + d.payment_status">{{ d.payment_status }}</span>
              </div>
              @if (d.coupon_code) {
                <div class="dc-val muted" style="margin-top: 0.5rem">Coupon: {{ d.coupon_code }}</div>
              }
            </div>

            <!-- Card 4: Order Summary -->
            <div class="detail-card summary-card">
              <div class="dc-title">Order Summary</div>
              <div class="summary-row"><span>Subtotal</span><span>₹{{ d.subtotal | number:'1.0-0' }}</span></div>
              @if (d.discount_amount > 0) {
                <div class="summary-row green"><span>Discount</span><span>-₹{{ d.discount_amount | number:'1.0-0' }}</span></div>
              }
              <div class="summary-row"><span>Shipping</span><span>{{ d.shipping_amount > 0 ? '₹' + (d.shipping_amount | number:'1.0-0') : 'Free' }}</span></div>
              <div class="summary-row"><span>Tax (GST)</span><span>₹{{ d.tax_amount | number:'1.0-0' }}</span></div>
              <div class="summary-row total"><span>Grand Total</span><span>₹{{ d.total_amount | number:'1.0-0' }}</span></div>
            </div>

          </div>

          <!-- Tabs (Shown only if shipment not created) -->
          @if (!d.tracking_number) {
            <div class="tabs-container">
              <button class="tab-btn" [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">Order Overview</button>
              <button class="tab-btn" [class.active]="activeTab() === 'booking'" (click)="activeTab.set('booking')">Book Shipment</button>
            </div>
          }

          <!-- TAB 1: OVERVIEW -->
          @if (d.tracking_number || activeTab() === 'overview') {
            <div class="detail-main-layout">
              
              <!-- Left Column: Products List & Special Instructions -->
              <div class="main-left">
                <!-- Products Table Card -->
                <div class="detail-card">
                  <div class="dc-title">Products</div>
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th style="width:36px"></th>
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
                              <div class="item-thumb-empty"></div>
                            }
                          </td>
                          <td>
                            <div class="item-name">{{ item.product_name }}</div>
                            @if (item.variant_name) { <div class="item-variant">{{ item.variant_name }}</div> }
                          </td>
                          <td>{{ item.quantity }}</td>
                          <td>₹{{ item.unit_price | number:'1.0-0' }}</td>
                          <td class="fw">₹{{ item.total_amount | number:'1.0-0' }}</td>
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
                    <div class="dc-title">Special Instructions</div>
                    <div class="dc-val">{{ d.special_instructions }}</div>
                  </div>
                }

                <!-- Manual Tracking and Action Buttons at the Bottom -->
                <div class="bottom-actions" style="margin-top: 1rem; display: flex; gap: 0.75rem;">
                  <button class="btn-secondary" (click)="openTracking(d)">
                    {{ d.tracking_number ? 'Update Tracking' : 'Manual Tracking' }}
                  </button>
                </div>
              </div>

              <!-- Right Column: Order History -->
              <div class="main-right">
                <div class="detail-card">
                  <div class="dc-top-row">
                    <div class="dc-title" style="margin-bottom:0">Order History</div>
                    <button class="btn-update-sm" (click)="openUpdateModal()">+ Update</button>
                  </div>

                  @if (d.tracking_number) {
                    <div class="dc-val fw" style="margin-top:0.6rem">AWB: {{ d.tracking_number }}</div>
                    @if (d.tracking_url) {
                      <a [href]="d.tracking_url" target="_blank" class="track-link">Track Package ↗</a>
                    }
                    <div style="height:0.5rem"></div>
                  }

                  @if (loadingHistory()) {
                    <div class="history-loading">Loading history…</div>
                  } @else if (statusHistory().length) {
                    <div class="status-tl">
                      @for (entry of statusHistory(); track entry.id; let last = $last) {
                        <div class="stl-row">
                          <div class="stl-aside">
                            <div class="stl-dot" [style.background]="entry.status_color || '#B87333'"></div>
                            @if (!last) { <div class="stl-line"></div> }
                          </div>
                          <div class="stl-body">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                              <div class="stl-name" [style.color]="entry.status_color || '#B87333'">
                                {{ entry.status_name || entry.status }}
                              </div>
                              <div class="stl-actions" style="display: flex; gap: 0.5rem; margin-top: -2px;">
                                <button (click)="openEditHistoryModal(entry)" class="btn-icon" title="Edit entry" style="background:none; border:none; color:#B87333; cursor:pointer; padding:2px; font-size:0.75rem; display:flex; align-items:center;">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button (click)="deleteHistoryEntry(entry)" class="btn-icon" title="Delete entry" style="background:none; border:none; color:#DC2626; cursor:pointer; padding:2px; font-size:0.75rem; display:flex; align-items:center;">
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
                  <div class="form-section-title">Booking Details</div>
                  <div class="form-grid-2">
                    <div class="field-group">
                      <label>Pickup Address</label>
                      <select class="form-input" [(ngModel)]="bookingForm.pickupLocation" name="pickupLocation">
                        <option value="Primary">Primary</option>
                        <option value="Warehouse 1">Warehouse 1</option>
                      </select>
                    </div>
                    <div class="field-group" style="justify-content: center; padding-top: 1.2rem;">
                      <label class="checkbox-label">
                        <input type="checkbox" [(ngModel)]="bookingForm.sameAsPickup" name="sameAsPickup" />
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
                  <div class="form-section-title">Delivery Address</div>
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
                  <div class="form-section-title">Box Details (Set Defaults)</div>
                  <div class="form-grid-4">
                    <div class="field-group">
                      <label>Weight of Parcel</label>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.weight" name="weight" required min="1" />
                        <span style="font-size: 0.8rem; color: #666; font-weight: 600; white-space: nowrap;">Grams (gm)</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Length of Parcel</label>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.length" name="length" required min="1" />
                        <span style="font-size: 0.8rem; color: #666; font-weight: 600; white-space: nowrap;">Centimetres (cm)</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Breadth of Parcel</label>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.breadth" name="breadth" required min="1" />
                        <span style="font-size: 0.8rem; color: #666; font-weight: 600; white-space: nowrap;">Centimetres (cm)</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label>Height of Parcel</label>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="number" class="form-input" [(ngModel)]="bookingForm.height" name="height" required min="1" />
                        <span style="font-size: 0.8rem; color: #666; font-weight: 600; white-space: nowrap;">Centimetres (cm)</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-grid-2" style="margin-top: 1rem;">
                    <div class="field-group">
                      <label>Volumetric Weight</label>
                      <div style="padding: 0.5rem 0.75rem; background: #F7F8FA; border: 1px solid #E8E8E8; border-radius: 6px; font-size: 0.875rem; font-weight: 600; color: #4A5568;">
                        {{ volumetricWeight }} kg
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Section 4: Shipment Details -->
                <div class="form-section">
                  <div class="form-section-title">Shipment Details</div>
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
                  <div class="form-section-title">Courier Rates & Booking</div>
                  
                  <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem;">
                    <button type="button" class="btn-primary" (click)="loadCouriersForForm()" [disabled]="loadingCouriers() || !isFormValid()">
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
                    <div class="couriers-list" style="margin-top: 0.75rem;">
                      @for (c of shiprocketCouriers(); track c.courier_company_id) {
                        <div class="courier-card" (click)="selectCourier(c)">
                          <div>
                            <div class="courier-name">{{ c.courier_name }}</div>
                            <div class="courier-meta">
                              <span>ETD: <strong>{{ c.etd }}</strong></span>
                              <span>★ {{ c.rating }}</span>
                              <span class="cod-tag" [class.cod-yes]="c.cod">{{ c.cod ? 'COD' : 'Prepaid' }}</span>
                            </div>
                          </div>
                          <div class="courier-right">
                            <div class="courier-rate">₹{{ c.rate }}</div>
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
            <h2>Update Order Status</h2>
            <button class="modal-close" (click)="closeUpdateModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Status *</label>
              <select [(ngModel)]="updateForm.status" class="form-input">
                @for (st of allStatuses(); track st.id) {
                  <option [value]="st.slug">{{ st.name }}</option>
                }
              </select>
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Date &amp; Time</label>
              <input type="datetime-local" [(ngModel)]="updateForm.date" class="form-input" />
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Remark <span style="font-weight:400;color:#AAAAAA">(optional)</span></label>
              <textarea [(ngModel)]="updateForm.note" class="form-input" rows="3" placeholder="Add a note about this status change…"></textarea>
            </div>
            @if (updateError()) { <div class="error-msg" style="margin-top:0.75rem">{{ updateError() }}</div> }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeUpdateModal()">Cancel</button>
            <button class="btn-primary" (click)="saveStatusUpdate()" [disabled]="updatingStatus()">
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
            <h2>{{ trackingOrder()?.tracking_number ? 'Update Tracking' : 'Manual Tracking Entry' }} — {{ trackingOrder()!.order_number }}</h2>
            <button class="modal-close" (click)="closeTracking()">✕</button>
          </div>
          <div class="modal-body">
            @if (trackingOrder()?.tracking_number) {
              <div class="active-shipment-card">
                <div style="font-weight:700;color:#276749;font-size:0.875rem">✓ Active Shipment</div>
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
            <h2>Edit Status History Entry</h2>
            <button class="modal-close" (click)="closeEditHistoryModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Status *</label>
              <select [(ngModel)]="editHistoryForm.status" class="form-input">
                @for (st of allStatuses(); track st.id) {
                  <option [value]="st.slug">{{ st.name }}</option>
                }
              </select>
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Date &amp; Time</label>
              <input type="datetime-local" [(ngModel)]="editHistoryForm.date" class="form-input" />
            </div>
            <div class="field" style="margin-top:1rem">
              <label>Remark <span style="font-weight:400;color:#AAAAAA">(optional)</span></label>
              <textarea [(ngModel)]="editHistoryForm.note" class="form-input" rows="3" placeholder="Add a note about this status change…"></textarea>
            </div>
            @if (editHistoryError()) { <div class="error-msg" style="margin-top:0.75rem">{{ editHistoryError() }}</div> }
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeEditHistoryModal()">Cancel</button>
            <button class="btn-primary" (click)="saveHistoryUpdate()" [disabled]="updatingHistory()">
              {{ updatingHistory() ? 'Updating…' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 1rem 0.5rem; max-width: 100%; width: 100%; box-sizing: border-box; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 0.5rem; }
    .btn-back { display: inline-block; color: #B87333; text-decoration: none; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; transition: color 0.15s; }
    .btn-back:hover { color: #9d5d22; }
    .order-title { font-size: 1.375rem; font-weight: 700; color: #1c1c1c; margin: 0.5rem 0 0 0; display: flex; align-items: center; gap: 0.75rem; }
    .order-date { font-size: 0.8rem; font-weight: 400; color: #888; background: #F0F0F0; padding: 2px 8px; border-radius: 12px; }
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .status-selector { display: flex; flex-direction: column; gap: 0.25rem; }
    .status-select-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.05em; }
    .status-select-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .status-dropdown { padding: 0.45rem 2rem 0.45rem 0.75rem; background: #fff; border: 1.5px solid #E8E8E8; border-radius: 6px; font-size: 0.8125rem; color: #1c1c1c; outline: none; cursor: pointer; transition: all 0.15s ease; font-weight: 600; }
    .status-dropdown:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184, 115, 51, 0.1); }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid transparent; text-align: center; }
    
    .detail-loading { padding: 4rem; text-align: center; color: #888; }
    .detail-body { display: flex; flex-direction: column; gap: 1rem; padding: 0 0.5rem; }
    
    /* 4-column layout */
    .detail-row-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    @media (max-width: 1024px) { .detail-row-4 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .detail-row-4 { grid-template-columns: 1fr; } }
    
    .detail-card { background: #FAFAFA; border: 1px solid #E8E8E8; border-radius: 8px; padding: 1rem; }
    .shipment-card { background: #fff; border-color: rgba(184,115,51,0.25); }
    .dc-title { font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #AAAAAA; margin-bottom: 0.5rem; }
    .dc-val { font-size: 0.8125rem; color: #4A5568; margin-top: 2px; }
    .fw { font-weight: 600; color: #1C1C1C !important; }

    .badge { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; background: #F0F0F0; color: #888; }
    .pay-paid { background: rgba(21,128,61,0.09); color: #15803D; }
    .pay-pending { background: rgba(180,83,9,0.1); color: #B45309; }
    .pay-failed { background: rgba(220,38,38,0.09); color: #DC2626; }

    /* Compact Items table */
    .items-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; margin-top: 0.5rem; }
    .items-table th { text-align: left; padding: 0.3rem 0.4rem; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #888; border-bottom: 1px solid #E8E8E8; }
    .items-table td { padding: 0.35rem 0.4rem; border-bottom: 1px solid #F0F0F0; vertical-align: middle; }
    .items-table tr:last-child td { border-bottom: none; }
    .item-thumb { width: 28px; height: 28px; object-fit: cover; border-radius: 4px; border: 1px solid #E8E8E8; }
    .item-thumb-empty { width: 28px; height: 28px; background: #F0F0F0; border-radius: 4px; }
    .item-name { font-weight: 600; color: #1C1C1C; font-size: 0.78rem; }
    .item-variant { font-size: 0.7rem; color: #888; margin-top: 1px; }

    /* Summary */
    .summary-card { font-size: 0.8125rem; }
    .summary-row { display: flex; justify-content: space-between; padding: 0.25rem 0; color: #4A5568; border-bottom: 1px solid #F0F0F0; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row.green { color: #15803D; }
    .summary-row.total { font-weight: 700; color: #1C1C1C; font-size: 0.875rem; border-top: 1px solid #E8E8E8; padding-top: 0.4rem; margin-top: 0.25rem; border-bottom: none; }

    .track-link { font-size: 0.75rem; color: #B87333; font-weight: 600; text-decoration: underline; display: inline-block; margin-top: 0.25rem; }

    /* Layout structure */
    .detail-main-layout { display: grid; grid-template-columns: 7fr 3fr; gap: 1rem; align-items: start; }
    @media (max-width: 1024px) { .detail-main-layout { grid-template-columns: 1fr; } }
    .main-left { display: flex; flex-direction: column; gap: 1rem; }
    .main-right { display: flex; flex-direction: column; gap: 1rem; }

    /* Order History Timeline */
    .dc-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .btn-update-sm { padding: 4px 12px; background: #B87333; color: #fff; border: none; border-radius: 4px; font-size: 0.72rem; font-weight: 700; cursor: pointer; flex-shrink: 0; }
    .btn-update-sm:hover { opacity: 0.88; }
    .history-loading { font-size: 0.72rem; color: #888; padding: 0.5rem 0; }
    .history-empty { font-size: 0.72rem; color: #AAA; font-style: italic; padding: 0.5rem 0; }
    .status-tl { display: flex; flex-direction: column; padding-top: 0.25rem; }
    .stl-row { display: flex; gap: 0.65rem; }
    .stl-aside { display: flex; flex-direction: column; align-items: center; }
    .stl-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
    .stl-line { flex: 1; width: 2px; background: #E8E8E8; margin: 4px 0; min-height: 14px; }
    .stl-body { padding-bottom: 0.9rem; flex: 1; min-width: 0; }
    .stl-name { font-size: 0.78rem; font-weight: 700; }
    .stl-date { font-size: 0.63rem; color: #AAAAAA; margin-top: 2px; }
    .stl-note { font-size: 0.7rem; color: #4A5568; background: #F7F8FA; border-left: 2px solid #E8E8E8; border-radius: 0 4px 4px 0; padding: 3px 7px; margin-top: 5px; font-style: italic; }


    /* Tabs */
    .tabs-container { display: flex; border-bottom: 2px solid #E8E8E8; margin-bottom: 0.5rem; }
    .tab-btn { padding: 0.5rem 1.25rem; background: none; border: none; border-bottom: 2px solid transparent; font-size: 0.875rem; font-weight: 600; color: #666; cursor: pointer; margin-bottom: -2px; transition: all 0.15s; }
    .tab-btn:hover { color: #B87333; }
    .tab-btn.active { color: #B87333; border-bottom-color: #B87333; }

    /* Booking Form Layout */
    .booking-container { background: #FAFAFA; border: 1px solid #E8E8E8; border-radius: 8px; padding: 1.25rem; }
    .booking-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-section { border: 1px solid #E8E8E8; border-radius: 8px; padding: 1.25rem; background: #fff; }
    .form-section-title { font-size: 0.8rem; font-weight: 700; color: #1C1C1C; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #F0F0F0; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    .form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    @media (max-width: 768px) {
      .form-grid-2, .form-grid-3, .form-grid-4 { grid-template-columns: 1fr; }
    }
    
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-group label { font-size: 0.7rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.02em; }
    .field-note { font-size: 0.65rem; color: #888; line-height: 1.2; }
    .field-error { font-size: 0.68rem; color: #DC2626; font-weight: 600; }
    
    .radio-group { display: flex; gap: 0.4rem; width: 100%; }
    .radio-btn { flex: 1; padding: 0.4rem 0.5rem; text-align: center; border: 1.5px solid #E8E8E8; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600; background: #FAFAFA; transition: all 0.15s; outline: none; }
    .radio-btn:hover { border-color: #B87333; }
    .radio-btn.selected { border-color: #B87333; background: rgba(184,115,51,0.05); color: #B87333; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #4A5568; cursor: pointer; font-weight: 600; }

    /* Shiprocket rates */
    .couriers-loading { font-size: 0.8rem; color: #888; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; }
    .couriers-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
    .courier-card { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; border: 1.5px solid #E8E8E8; border-radius: 6px; cursor: pointer; background: #FAFAFA; transition: border-color 0.15s; }
    .courier-card:hover { border-color: #B87333; background: #fff; }
    .courier-name { font-weight: 600; color: #1C1C1C; font-size: 0.8rem; }
    .courier-meta { font-size: 0.7rem; color: #888; margin-top: 1px; display: flex; gap: 0.75rem; align-items: center; }
    .cod-tag { padding: 1px 5px; border-radius: 3px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; background: rgba(220,38,38,0.08); color: #DC2626; }
    .cod-tag.cod-yes { background: rgba(21,128,61,0.08); color: #15803D; }
    .courier-right { text-align: right; }
    .courier-rate { font-weight: 700; color: #B87333; font-size: 0.875rem; }
    .btn-book-sm { padding: 3px 8px; background: #B87333; color: #fff; border: none; border-radius: 4px; font-size: 0.72rem; font-weight: 600; cursor: pointer; margin-top: 0.25rem; }
    .btn-book-sm:hover:not(:disabled) { background: #9d5d22; }
    .btn-book-sm:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E8; }
    .modal-header h2 { font-size: 0.95rem; font-weight: 700; color: #1C1C1C; margin: 0; }
    .modal-close { background: none; border: none; color: #888; font-size: 1rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: color 0.15s; flex-shrink: 0; }
    .modal-close:hover { color: #1C1C1C; }
    .modal-body { padding: 1.25rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 0.75rem 1.25rem; border-top: 1px solid #E8E8E8; }

    .active-shipment-card { padding: 0.8rem; border: 1.5px solid #276749; border-radius: 8px; background: rgba(39,103,73,0.04); margin-bottom: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; }
    .form-input { padding: 0.4rem 0.6rem; background: #fff; border: 1px solid #E8E8E8; border-radius: 6px; color: #1C1C1C; font-size: 0.8125rem; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.15s; }
    .form-input:focus { border-color: #B87333; box-shadow: 0 0 0 3px rgba(184,115,51,0.1); }
    .form-input::placeholder { color: #AAAAAA; }

    .error-msg { color: #DC2626; padding: 0.6rem; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 6px; margin-bottom: 1rem; font-size: 0.8125rem; }
    .error-msg button { background: none; border: 1px solid #DC2626; color: #DC2626; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; margin-left: 0.5rem; }
    .success-msg { color: #15803D; padding: 0.6rem; background: rgba(21,128,61,0.06); border: 1px solid rgba(21,128,61,0.2); border-radius: 6px; margin-top: 0.75rem; font-size: 0.8125rem; font-weight: 600; }
    .btn-secondary { padding: 0.4rem 1rem; background: #fff; border: 1px solid #E8E8E8; color: #555; border-radius: 6px; font-size: 0.8125rem; cursor: pointer; transition: background 0.15s; }
    .btn-secondary:hover { background: #F7F8FA; }
    .btn-primary { padding: 0.4rem 1.25rem; background: #B87333; color: #fff; border: none; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .spinner-sm { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(184,115,51,0.2); border-top-color: #B87333; border-radius: 50%; animation: spin 0.8s linear infinite; }
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
