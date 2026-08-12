import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface CourierRate {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  expected_delivery_date: string;
  etd: string;
  rating: string;
  cod: number;
  charge_weight?: number;
  etd_hours?: number;
  raw_details?: any;
  delivery_performance?: string;
  rto_charge?: number;
  freight_charge?: number;
  cod_charges?: number;
  avg_forward_days?: number;
  avg_rto_days?: number;
}

@Component({
  selector: 'lk-admin-rate-calculator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Courier Rates Calculator</h1>
        <p class="subtitle">Real-time shipping estimation using Shiprocket</p>
      </div>

      <!-- Compact Top Calculator Form (Full Width) -->
      <div class="card form-card">
        <form (submit)="calculate($event)" class="calc-form">
          <div class="form-grid">
            
            <!-- Sender Pincode -->
            <div class="field">
              <label>Pincode of Sender*</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 14.5C8 14.5 12.5 10.2 12.5 6.5C12.5 3.7 10.3 1.5 8 1.5C5.7 1.5 3.5 3.7 3.5 6.5C3.5 10.2 8 14.5 8 14.5Z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6.5" r="1.7" stroke="currentColor" stroke-width="1.3"/></svg>
                </span>
                <input type="text" [(ngModel)]="senderPincode" name="senderPincode" class="form-input" placeholder="360002" required pattern="^\\d{6}$" maxlength="6" />
              </div>
            </div>

            <!-- Receiver Pincode -->
            <div class="field">
              <label>Pincode of Receiver*</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 14.5V1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M3.5 2.5H12L10 5L12 7.5H3.5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                </span>
                <input type="text" [(ngModel)]="receiverPincode" name="receiverPincode" class="form-input" placeholder="Enter Pincode" required pattern="^\\d{6}$" maxlength="6" />
              </div>
            </div>

            <!-- Weight of Parcel -->
            <div class="field">
              <label>Weight of Parcel*</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="6.5" width="2" height="3.5" rx="0.5" fill="currentColor"/><rect x="13" y="6.5" width="2" height="3.5" rx="0.5" fill="currentColor"/><rect x="3" y="5.5" width="1.4" height="5.5" rx="0.4" fill="currentColor"/><rect x="11.6" y="5.5" width="1.4" height="5.5" rx="0.4" fill="currentColor"/><line x1="4.4" y1="8" x2="11.6" y2="8" stroke="currentColor" stroke-width="1.2"/></svg>
                </span>
                <input type="number" [(ngModel)]="weight" name="weight" class="form-input" placeholder="1.0" step="0.01" min="0.01" required />
                <span class="input-unit">Kg</span>
              </div>
              <span class="field-sublbl">Kilograms (Kg)</span>
            </div>

            <!-- Parcel Value -->
            <div class="field">
              <label>Parcel Value ₹*</label>
              <div class="input-wrapper">
                <span class="input-icon" style="font-size:0.8rem;font-weight:600">₹</span>
                <input type="number" [(ngModel)]="parcelValue" name="parcelValue" class="form-input" placeholder="1000" min="1" required />
              </div>
            </div>

            <!-- Length of Parcel -->
            <div class="field">
              <label>Length of Parcel (Optional)</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="6" width="13" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M4 6V8M6.5 6V7.3M9 6V8M11.5 6V7.3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
                </span>
                <input type="number" [(ngModel)]="length" name="length" class="form-input" placeholder="L" min="1" />
                <span class="input-unit">cm</span>
              </div>
              <span class="field-sublbl">Centimetres (cm)</span>
            </div>

            <!-- Breadth of Parcel -->
            <div class="field">
              <label>Breadth of Parcel (Optional)</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8H14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2 8L4.5 5.5M2 8L4.5 10.5M14 8L11.5 5.5M14 8L11.5 10.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <input type="number" [(ngModel)]="breadth" name="breadth" class="form-input" placeholder="W" min="1" />
                <span class="input-unit">cm</span>
              </div>
              <span class="field-sublbl">Centimetres (cm)</span>
            </div>

            <!-- Height of Parcel -->
            <div class="field">
              <label>Height of Parcel (Optional)</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2V14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M8 2L5.5 4.5M8 2L10.5 4.5M8 14L5.5 11.5M8 14L10.5 11.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <input type="number" [(ngModel)]="height" name="height" class="form-input" placeholder="H" min="1" />
                <span class="input-unit">cm</span>
              </div>
              <span class="field-sublbl">Centimetres (cm)</span>
            </div>

            <!-- Volumetric Weight (computed read-only) -->
            <div class="field">
              <label>Volumetric Weight</label>
              <div class="read-only-display">
                <span class="display-val">{{ getFormattedVolumetricWeight() }}</span>
              </div>
              <span class="field-sublbl">(L × B × H) / 5000</span>
            </div>

            <!-- Shipment Mode -->
            <div class="field">
              <label>Shipment Mode*</label>
              <div class="mode-options">
                <label class="toggle-option" [class.active]="shipmentMode === 'road'">
                  <input type="radio" value="road" [(ngModel)]="shipmentMode" name="shipmentMode" class="hidden-radio" />
                  <span>Road</span>
                </label>
                <label class="toggle-option" [class.active]="shipmentMode === 'air'">
                  <input type="radio" value="air" [(ngModel)]="shipmentMode" name="shipmentMode" class="hidden-radio" />
                  <span>Air</span>
                </label>
              </div>
            </div>

            <!-- Parcel Type -->
            <div class="field">
              <label>Parcel Type*</label>
              <div class="mode-options block-3">
                <label class="toggle-option" [class.active]="parcelType === 'prepaid'">
                  <input type="radio" value="prepaid" [(ngModel)]="parcelType" name="parcelType" class="hidden-radio" />
                  <span>Prepaid</span>
                </label>
                <label class="toggle-option" [class.active]="parcelType === 'cod'">
                  <input type="radio" value="cod" [(ngModel)]="parcelType" name="parcelType" class="hidden-radio" />
                  <span>COD</span>
                </label>
                <label class="toggle-option" [class.active]="parcelType === 'reverse'">
                  <input type="radio" value="reverse" [(ngModel)]="parcelType" name="parcelType" class="hidden-radio" />
                  <span>Reverse</span>
                </label>
              </div>
            </div>

            <!-- Action Button -->
            <div class="field btn-field">
              <button type="submit" class="btn-calculate-large" [disabled]="loading()">
                @if (loading()) {
                  <span class="spinner-sm"></span>
                } @else {
                  <span>Calculate Rates</span>
                }
              </button>
            </div>

          </div>
        </form>

        <!-- Volumetric & Chargeable Weight Calculations Summary Banner -->
        <div class="weight-summary-banner">
          <div class="banner-item">
            <span class="banner-lbl">Actual Weight:</span>
            <strong class="banner-val">{{ weight || 0 }} kg</strong>
          </div>
          @if (length && breadth && height) {
            <div class="banner-sep">|</div>
            <div class="banner-item">
              <span class="banner-lbl">Volumetric Weight:</span>
              <strong class="banner-val">
                ({{ length }} × {{ breadth }} × {{ height }}) / 5000 = 
                <span class="highlight-val-blue">{{ getFormattedVolumetricWeight() }}</span>
              </strong>
            </div>
            <div class="banner-sep">|</div>
            <div class="banner-item final-highlight">
              <span class="banner-lbl">Chargeable Weight (Heavier):</span>
              <strong class="banner-val highlight-val-gold">
                {{ getChargeableWeight() | number:'1.2-2' }} kg
              </strong>
            </div>
          }
        </div>

      </div>

      <!-- Comparison Results (Side-by-Side) -->
      @if (loading()) {
        <div class="card status-card">
          <div class="shimmer-container">
            <div class="shimmer-pulse title-shimmer"></div>
            <div class="shimmer-pulse text-shimmer"></div>
            <div class="shimmer-pulse card-shimmer"></div>
          </div>
        </div>
      } @else if (error()) {
        <div class="card error-card">
          <div class="error-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4L29 26H3L16 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 13V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="22.5" r="1.2" fill="currentColor"/></svg>
          </div>
          <h3>Calculation Failed</h3>
          <p class="error-msg">{{ error() }}</p>
          <button class="btn-secondary" (click)="error.set('')">Dismiss</button>
        </div>
      } @else if (hasCalculated()) {
        
        <!-- Search and Global Filter -->
        <div class="filter-header">
          <div class="filters-container">
            <div class="filter-search-wrap">
              <svg class="filter-search-icon" width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.2" stroke="currentColor" stroke-width="1.4"/><path d="M11 11L14.5 14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              <input type="text" placeholder="Filter couriers by name..." [(ngModel)]="searchFilter" class="filter-input" />
            </div>
            <div class="sort-select-wrap">
              <select [(ngModel)]="sortBy" class="sort-select">
                <option value="rate-asc">Price: Low to High</option>
                <option value="rate-desc">Price: High to Low</option>
                <option value="rating-desc">Rating: High to Low</option>
              </select>
              <svg class="sort-caret" width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
        </div>

        <!-- Rates Layout -->
        <div class="comparison-grid">
          
          <div class="provider-column">
            <div class="provider-header sr-header">
              <div class="header-main">
                <h2>
                  <span class="ph-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
                  Available Rates
                </h2>
                <span class="couriers-count">{{ filteredShiprocket().length }} Serviceable</span>
              </div>
              @if (shiprocketError()) {
                <span class="col-error">⚠️ {{ shiprocketError() }}</span>
              } @else if (filteredShiprocket().length > 0) {
                <div class="col-summary">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  Cheapest: <strong>₹{{ cheapestShiprocket()?.rate }}</strong> <span class="col-summary-name">({{ cheapestShiprocket()?.courier_name }})</span>
                </div>
              }
            </div>

            <div class="couriers-list">
              @for (c of filteredShiprocket(); track c.courier_company_id) {
                <div class="courier-card" [class.cheapest-highlight]="c.courier_company_id === cheapestShiprocket()?.courier_company_id">
                  
                  <div class="courier-compact-layout">
                    <!-- Left: Courier Identity & Success rate -->
                    <div class="c-col-identity">
                      <div class="c-title-row">
                        <div class="c-logo-container">
                          @if (hasLogo(c.courier_name)) {
                            <img [src]="getCourierLogo(c.courier_name)" [alt]="c.courier_name" class="courier-logo-img" (error)="onLogoError(c.courier_name)" />
                          } @else {
                            <div class="courier-logo-fallback" [style.background-color]="getBrandBg(c.courier_name)">
                              {{ getInitials(c.courier_name) }}
                            </div>
                          }
                        </div>
                        <span class="c-name">{{ c.courier_name }}</span>
                        @if (c.courier_company_id === cheapestShiprocket()?.courier_company_id) {
                          <span class="mini-badge cheapest">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                            Cheapest
                          </span>
                        }
                      </div>
                      <div class="c-performance">
                        <span class="performance-label">Delivery Rate:</span>
                        <strong class="performance-val">{{ c.delivery_performance || '95%' }}</strong>
                      </div>
                      <div class="c-rating-stars">
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.6l1.9 4h4.2l-3.4 2.9 1.2 4.2L8 10.3l-3.9 2.4 1.2-4.2L1.9 5.6h4.2L8 1.6Z"/></svg>
                        {{ c.rating }}
                      </div>
                    </div>

                    <!-- Center: Transit Days & Timelines -->
                    <div class="c-col-stats">
                      <div class="stat-line">
                        <span class="stat-lbl font-bold">Forward TAT:</span>
                        <strong class="stat-val timeline-val">{{ c.etd }}</strong>
                      </div>
                      <div class="stat-line">
                        <span class="stat-lbl">AVG Forward:</span>
                        <strong class="stat-val days-val">{{ c.avg_forward_days !== undefined ? (c.avg_forward_days + ' Day' + (c.avg_forward_days !== 1 ? 's' : '')) : getAvgDays(c.etd, c.etd_hours) }}</strong>
                      </div>
                      <div class="stat-line">
                        <span class="stat-lbl">AVG RTO:</span>
                        <strong class="stat-val days-val">{{ c.avg_rto_days !== undefined ? (c.avg_rto_days + ' Day' + (c.avg_rto_days !== 1 ? 's' : '')) : getRtoDays(c.etd, c.etd_hours) }}</strong>
                      </div>
                    </div>

                    <!-- Right: Pricing Breakdown & Total -->
                    <div class="c-col-breakdown">
                      <div class="breakdown-line">
                        <span class="breakdown-lbl">Base Freight:</span>
                        <span class="breakdown-val">₹{{ c.freight_charge | number:'1.0-1' }}</span>
                      </div>
                      <div class="breakdown-line">
                        <span class="breakdown-lbl">COD Fee:</span>
                        <span class="breakdown-val">₹{{ (c.cod_charges || 0) | number:'1.0-1' }}</span>
                      </div>
                      <div class="breakdown-line">
                        <span class="breakdown-lbl">RTO Charge:</span>
                        <span class="breakdown-val">₹{{ (c.rto_charge || c.rate * 0.9) | number:'1.0-1' }}</span>
                      </div>
                      <div class="total-line">
                        <span class="total-lbl">Total Rate:</span>
                        <strong class="total-val">₹{{ c.rate | number:'1.2-2' }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Card footer links -->
                  <div class="card-footer-row">
                    <span class="c-charge-weight">Charged Wt: <strong>{{ c.charge_weight || getChargeableWeight() }}kg</strong></span>
                    <button class="btn-details-link" (click)="toggleDetails(c.courier_company_id)">
                      {{ isExpanded(c.courier_company_id) ? 'Hide API details' : 'All API details' }}
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" [style.transform]="isExpanded(c.courier_company_id) ? 'rotate(180deg)' : 'none'"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                  </div>

                  @if (isExpanded(c.courier_company_id)) {
                    <div class="api-inspector">
                      <div class="inspector-title">Shiprocket API Raw Fields</div>
                      <div class="inspector-grid">
                        @for (entry of getObjectEntries(c.raw_details); track entry.key) {
                          <div class="ins-item">
                            <span class="ins-lbl">{{ entry.key }}</span>
                            <span class="ins-val" [class.yes-val]="isHighlightable(entry.value)">{{ entry.value }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
              @if (filteredShiprocket().length === 0) {
                <div class="empty-col-state">No serviceable providers found.</div>
              }
            </div>
          </div>

        </div>

      } @else {
        <div class="card empty-card">
          <div class="empty-illustration">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="16" width="24" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M28 22H35L40 27V32H28V22Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="14" cy="34" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="33" cy="34" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
          </div>
          <h3>Calculate Shipping Rates</h3>
          <p>Configure the shipment details above and click Calculate to view rates from the Shiprocket aggregator network.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 2rem;
      width: 100%;
      margin: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.375rem;
      font-weight: 700;
      color: #1C1C1C;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.01em;
    }

    .subtitle {
      color: #888888;
      font-size: 0.85rem;
      margin: 0;
    }

    .card {
      background: #ffffff;
      border: 1px solid #E0D8C8;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      box-sizing: border-box;
    }

    .form-card {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .calc-form {
      display: flex;
      flex-direction: column;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      align-items: end;
    }

    @media (min-width: 1200px) {
      .form-grid {
        grid-template-columns: repeat(4, 1fr);
      }
      .btn-field {
        grid-column: span 2;
      }
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .field label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #555;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 0.65rem;
      display: flex;
      align-items: center;
      pointer-events: none;
      color: #888;
    }

    .form-input {
      width: 100%;
      padding: 0.45rem 1.75rem 0.45rem 1.65rem;
      border: 1px solid #E0D8C8;
      border-radius: 8px;
      font-size: 0.825rem;
      color: #1C1C1C;
      outline: none;
      transition: all 0.15s ease-in-out;
      background: #FFF;
      box-sizing: border-box;
      height: 34px;
    }

    .form-input:hover {
      border-color: #D0C4AE;
    }

    .form-input:focus {
      border-color: #B87333;
      box-shadow: 0 0 0 3px rgba(184, 115, 51, 0.1);
    }

    .input-unit {
      position: absolute;
      right: 0.55rem;
      font-size: 0.68rem;
      color: #AAAAAA;
      font-weight: 700;
      pointer-events: none;
    }

    .read-only-display {
      width: 100%;
      padding: 0.45rem 0.5rem;
      border: 1px solid #E0D8C8;
      border-radius: 8px;
      font-size: 0.825rem;
      font-weight: 700;
      color: #1D4ED8;
      background: #FAF8F5;
      text-align: center;
      box-sizing: border-box;
      height: 33px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .field-sublbl {
      font-size: 0.62rem;
      color: #AAAAAA;
      font-weight: 600;
      margin-top: 1px;
    }

    .mode-options {
      display: flex;
      gap: 0.25rem;
      width: 100%;
      height: 33px;
      box-sizing: border-box;
    }

    .toggle-option {
      flex: 1;
      border: 1px solid #E0D8C8;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.15s ease-in-out;
      background: #FAF8F5;
      text-align: center;
      font-weight: 700;
      font-size: 0.78rem;
      color: #1C1C1C;
    }

    .toggle-option:hover {
      border-color: #B87333;
    }

    .toggle-option.active {
      border-color: #B87333;
      background: rgba(184, 115, 51, 0.04);
      color: #B87333;
    }

    .hidden-radio {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .btn-calculate-large {
      width: 100%;
      height: 34px;
      background: linear-gradient(135deg, #B87333 0%, #9D5D22 100%);
      color: #FFF;
      border: none;
      border-radius: 8px;
      font-size: 0.825rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(184, 115, 51, 0.15);
    }

    .btn-calculate-large:hover {
      opacity: 0.95;
      transform: translateY(-0.5px);
    }

    .btn-calculate-large:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Weight Summary Banner Styles */
    .weight-summary-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      background: #FAF8F5;
      border: 1px solid #EDE8E0;
      border-radius: 8px;
      padding: 0.65rem 1rem;
      font-size: 0.78rem;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .banner-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .banner-lbl {
      color: #888888;
      font-weight: 500;
    }

    .banner-val {
      color: #1C1C1C;
    }

    .banner-sep {
      color: #E0D8C8;
      font-weight: 300;
    }

    @media (max-width: 768px) {
      .banner-sep {
        display: none;
      }
      .weight-summary-banner {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.4rem;
      }
    }

    .highlight-val-blue {
      color: #1D4ED8;
      font-weight: 700;
    }

    .highlight-val-gold {
      color: #B87333;
      font-weight: 800;
    }

    .final-highlight {
      background: rgba(184, 115, 51, 0.05);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid rgba(184, 115, 51, 0.15);
    }

    /* Filtering row */
    .filter-header {
      padding: 0 0.5rem;
      margin-bottom: 0.75rem;
    }

    .filters-container {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .filter-search-wrap { position: relative; display: flex; align-items: center; }
    .filter-search-icon { position: absolute; left: 0.55rem; color: #AAAAAA; pointer-events: none; }
    .sort-select-wrap { position: relative; display: flex; align-items: center; }
    .sort-caret { position: absolute; right: 0.55rem; color: #999; pointer-events: none; }

    .filter-input, .sort-select {
      padding: 0.4rem 0.6rem;
      border: 1px solid #E0D8C8;
      border-radius: 8px;
      font-size: 0.75rem;
      color: #333;
      outline: none;
      background: #FFF;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .filter-input { padding-left: 1.9rem; }
    .sort-select { appearance: none; padding-right: 1.7rem; cursor: pointer; }

    .filter-input:hover, .sort-select:hover { border-color: #D0C4AE; }
    .filter-input:focus, .sort-select:focus {
      border-color: #B87333;
      box-shadow: 0 0 0 3px rgba(184,115,51,0.1);
    }

    .filter-input {
      width: 200px;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      align-items: start;
      width: 100%;
    }

    .provider-column {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: #fff;
      border: 1px solid #E0D8C8;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .provider-header {
      border-bottom: 1px solid #F3EFE8;
      padding-bottom: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .provider-header h2 {
      font-size: 1rem;
      font-weight: 800;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .ph-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: rgba(184,115,51,0.1);
      color: #B87333;
      flex-shrink: 0;
    }

    .sr-header h2 {
      color: #1C1C1C;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .couriers-count {
      font-size: 0.72rem;
      color: #888888;
      background: #F3EFE8;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 700;
    }

    .col-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #15803D;
      background: rgba(21,128,61,0.06);
      border: 1px solid rgba(21,128,61,0.18);
      border-radius: 8px;
      padding: 0.55rem 0.8rem;
    }

    .col-summary strong { font-weight: 800; }
    .col-summary-name { color: #4B7A5E; }

    .col-error {
      font-size: 0.8rem;
      color: #DC2626;
      font-weight: 600;
      background: rgba(220,38,38,0.06);
      border: 1px solid rgba(220,38,38,0.18);
      border-radius: 8px;
      padding: 0.55rem 0.8rem;
    }

    .empty-col-state {
      text-align: center;
      padding: 2.5rem 1rem;
      font-size: 0.82rem;
      color: #AAAAAA;
      font-style: italic;
      background: #FAF8F5;
      border: 1px dashed #E0D8C8;
      border-radius: 10px;
    }

    /* Courier list items */
    .couriers-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* Courier cards (Three-column layout) */
    .courier-card {
      background: #fff;
      border: 1px solid #E0D8C8;
      border-radius: 12px;
      padding: 1rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      transition: all 0.15s ease;
    }

    .courier-card:hover {
      border-color: #B87333;
      box-shadow: 0 4px 14px rgba(184, 115, 51, 0.1);
      transform: translateY(-1px);
    }

    .courier-card.cheapest-highlight {
      border-color: rgba(21,128,61,0.35);
      background: linear-gradient(rgba(21,128,61,0.045), rgba(21,128,61,0.045)), #fff;
    }

    .courier-compact-layout {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1fr;
      gap: 1rem;
      align-items: start;
    }

    @media (max-width: 480px) {
      .courier-compact-layout {
        grid-template-columns: 1fr;
        gap: 0.6rem;
      }
    }

    /* Column 1: Identity & Success Rate */
    .c-col-identity {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .c-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .c-logo-container {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3EFE8;
      border: 1px solid #E0D8C8;
      flex-shrink: 0;
    }

    .courier-logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .courier-logo-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      border-radius: 7px;
    }

    .c-name {
      font-weight: 700;
      font-size: 0.88rem;
      color: #1C1C1C;
      line-height: 1.25;
    }

    .c-performance {
      font-size: 0.75rem;
      color: #555555;
      margin-top: 1px;
    }

    .performance-label {
      color: #888888;
    }

    .performance-val {
      color: #15803D;
    }

    .c-rating-stars {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #B45309;
      font-weight: 700;
      font-size: 0.75rem;
    }

    /* Column 2: Transit & Stats */
    .c-col-stats {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      border-left: 1px solid #F3EFE8;
      border-right: 1px solid #F3EFE8;
      padding: 0 0.9rem;
    }

    .stat-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      gap: 0.5rem;
    }

    .stat-lbl {
      color: #888888;
    }

    .stat-val {
      color: #1C1C1C;
      font-weight: 700;
    }

    .timeline-val {
      color: #B87333;
    }

    .days-val {
      color: #15803D;
    }

    /* Column 3: Breakdown & Total */
    .c-col-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      text-align: right;
    }

    .breakdown-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #888888;
      gap: 0.5rem;
    }

    .breakdown-val {
      color: #555555;
      font-weight: 600;
    }

    .total-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 0.8rem;
      border-top: 1px dashed #E0D8C8;
      padding-top: 0.4rem;
      margin-top: 0.15rem;
      gap: 0.5rem;
    }

    .total-lbl {
      font-weight: 700;
      color: #1C1C1C;
    }

    .total-val {
      color: #B87333;
      font-weight: 800;
      font-size: 1rem;
    }

    /* Card Footer Area */
    .card-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #F3EFE8;
      padding-top: 0.65rem;
      font-size: 0.72rem;
    }

    .c-charge-weight {
      color: #AAAAAA;
    }

    .c-charge-weight strong {
      color: #888888;
    }

    .btn-details-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      color: #B87333;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      transition: opacity 0.15s;
    }

    .btn-details-link:hover {
      opacity: 0.75;
    }

    .btn-details-link svg {
      transition: transform 0.15s ease;
    }

    /* Dynamic API Inspector */
    .api-inspector {
      background: #FAF8F5;
      border: 1px solid #E0D8C8;
      border-radius: 8px;
      padding: 0.75rem 0.9rem;
      font-size: 0.7rem;
      animation: expandDown 0.15s ease-out;
      margin-top: 0.15rem;
    }

    .inspector-title {
      font-size: 0.63rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #AAAAAA;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #E0D8C8;
      padding-bottom: 0.4rem;
    }

    .inspector-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.5rem 0.75rem;
    }

    .ins-item {
      display: flex;
      flex-direction: column;
    }

    .ins-lbl {
      font-size: 0.6rem;
      font-weight: 600;
      color: #AAAAAA;
    }

    .ins-val {
      font-weight: 500;
      color: #1C1C1C;
      word-break: break-all;
    }

    .yes-val {
      color: #15803D;
      font-weight: 700;
    }

    /* Badges */
    .mini-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .mini-badge.cheapest {
      background: rgba(21,128,61,0.1);
      color: #15803D;
    }

    .mini-badge.cod {
      background: rgba(39, 103, 73, 0.06);
      color: #15803D;
    }

    .mini-badge.prepaid {
      background: rgba(184, 115, 51, 0.06);
      color: #B87333;
    }

    /* Global Empty state */
    .empty-card {
      text-align: center;
      padding: 3rem 1.5rem;
      color: #888888;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: 2px dashed #E0D8C8;
      background: #FAF8F5;
    }

    .empty-illustration {
      color: #B87333;
      opacity: 0.6;
    }

    .empty-card h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #1C1C1C;
      margin: 0;
    }

    .empty-card p {
      max-width: 320px;
      font-size: 0.78rem;
      margin: 0;
      line-height: 1.4;
    }

    /* Errors */
    .error-card {
      border-color: rgba(220,38,38,0.3);
      background: rgba(220,38,38,0.05);
      text-align: center;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }

    .error-icon {
      color: #DC2626;
    }

    .error-card h3 {
      color: #DC2626;
      margin: 0;
      font-size: 0.95rem;
    }

    .btn-secondary {
      padding: 0.5rem 1.25rem;
      background: #fff;
      border: 1px solid #E0D8C8;
      color: #555;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-secondary:hover {
      background: #F7F8FA;
    }

    .error-msg {
      font-size: 0.78rem;
      color: #DC2626;
      margin: 0 0 0.5rem 0;
    }

    .status-card {
      padding: 1.5rem;
    }

    .shimmer-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .shimmer-pulse {
      background: linear-gradient(90deg, #F0ECE6 25%, #E2DDD5 50%, #F0ECE6 75%);
      background-size: 200% 100%;
      animation: loading-shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .title-shimmer { height: 18px; width: 30%; }
    .text-shimmer { height: 12px; width: 60%; margin-bottom: 0.5rem; }
    .card-shimmer { height: 75px; width: 100%; }

    .spinner-sm {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes loading-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @keyframes expandDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminRateCalculatorComponent {
  private readonly api = inject(ApiService);

  // Form Inputs
  senderPincode = '360002';
  receiverPincode = '';
  weight = 1.0;
  parcelValue = 1000;
  length?: number;
  breadth?: number;
  height?: number;
  shipmentMode = 'road'; // 'road' or 'air'
  parcelType = 'prepaid'; // 'prepaid', 'cod', or 'reverse'

  // Output Signals
  hasCalculated = signal(false);
  loading = signal(false);
  error = signal('');

  // Individual provider rates and errors
  shiprocketRates = signal<CourierRate[]>([]);
  shiprocketError = signal<string | null>(null);

  // UI Filters / Sorting
  searchFilter = '';
  sortBy = 'rate-asc';

  // Summary Metrics
  cheapestShiprocket = signal<CourierRate | null>(null);
  highestRated = signal<CourierRate | null>(null);

  // Expanded Courier Details set (stores company IDs)
  expandedCourierIds = signal<Set<number>>(new Set());

  // Keep track of failed images
  failedLogos = new Set<string>();

  onLogoError(name: string): void {
    this.failedLogos.add(name.toLowerCase());
  }

  hasLogo(name: string): boolean {
    const q = name.toLowerCase();
    const hasUrl = !!this.getCourierLogo(name);
    return hasUrl && !this.failedLogos.has(q);
  }

  getCourierLogo(name: string): string {
    const q = name.toLowerCase();
    if (q.includes('delhivery')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Delhivery_Logo.png';
    }
    if (q.includes('bluedart') || q.includes('blue dart')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Blue_Dart_Courier_logo.svg/320px-Blue_Dart_Courier_logo.svg.png';
    }
    if (q.includes('dtdc')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/2/25/DTDC_Logo.png';
    }
    if (q.includes('dhl')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/DHL_Logo.svg/320px-DHL_Logo.svg.png';
    }
    if (q.includes('fedex')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/FedEx_Express_logo.svg/320px-FedEx_Express_logo.svg.png';
    }
    if (q.includes('xpressbees')) {
      return 'https://xpressbees.com/wp-content/themes/xpressbees/images/logo.png';
    }
    if (q.includes('maruti') || q.includes('shree maruti')) {
      return 'https://shreemaruticourier.com/wp-content/uploads/2020/09/Logo.png';
    }
    if (q.includes('shadowfax')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Shadowfax_Logo.png';
    }
    if (q.includes('ecom')) {
      return 'https://ecomexpress.in/wp-content/uploads/2020/05/logo.png';
    }
    return '';
  }

  getBrandBg(name: string): string {
    const q = name.toLowerCase();
    if (q.includes('delhivery')) return '#1C1C1C';
    if (q.includes('bluedart') || q.includes('blue dart')) return '#FFD200';
    if (q.includes('dtdc')) return '#003366';
    if (q.includes('dhl')) return '#D40511';
    if (q.includes('fedex')) return '#4D148C';
    if (q.includes('xpressbees')) return '#FF5C00';
    if (q.includes('maruti')) return '#E30613';
    if (q.includes('shadowfax')) return '#FCD206';
    if (q.includes('ecom')) return '#0D47A1';
    return '#B87333'; // Default brand copper/bronze
  }

  getInitials(name: string): string {
    const clean = name.replace(/\(via\s+\w+\)/gi, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  }

  getVolumetricWeight(): number {
    if (!this.length || !this.breadth || !this.height) {
      return 0;
    }
    return (this.length * this.breadth * this.height) / 5000;
  }

  getFormattedVolumetricWeight(): string {
    const vol = this.getVolumetricWeight();
    if (vol <= 0) return '-';
    if (vol < 1) {
      return `${Math.round(vol * 1000)} gm`;
    }
    return `${vol.toFixed(2)} kg`;
  }

  getChargeableWeight(): number {
    const volWeight = this.getVolumetricWeight();
    return Math.max(this.weight || 0, volWeight);
  }

  calculate(event: Event): void {
    event.preventDefault();
    if (!this.senderPincode || !this.receiverPincode || !this.weight) {
      this.error.set('Please fill out all required fields.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.shiprocketRates.set([]);
    this.shiprocketError.set(null);
    this.cheapestShiprocket.set(null);
    this.expandedCourierIds.set(new Set());

    const body = {
      pickup_pincode: this.senderPincode,
      delivery_pincode: this.receiverPincode,
      weight: this.getChargeableWeight(),
      cod: this.parcelType === 'cod',
      declared_value: this.parcelValue,
      length: this.length || undefined,
      width: this.breadth || undefined,
      height: this.height || undefined,
      shipment_mode: this.shipmentMode,
      parcel_type: this.parcelType
    };

    this.api.post<any>('/admin/shiprocket/calculate-rates', body).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.hasCalculated.set(true);

        const srList = Array.isArray(res.data) ? res.data : [];
        this.shiprocketRates.set(srList);
        if (srList.length > 0) {
          const sortedSR = [...srList].sort((a, b) => a.rate - b.rate);
          this.cheapestShiprocket.set(sortedSR[0]);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || err.userMessage || 'An error occurred while calculating rates.');
        this.loading.set(false);
      }
    });
  }

  // Filter & Sort Shiprocket rates list
  filteredShiprocket(): CourierRate[] {
    let result = [...this.shiprocketRates()];

    // Search filter
    if (this.searchFilter.trim()) {
      const q = this.searchFilter.toLowerCase().trim();
      result = result.filter(c => c.courier_name.toLowerCase().includes(q));
    }

    // Sorting
    if (this.sortBy === 'rate-asc') {
      result.sort((a, b) => a.rate - b.rate);
    } else if (this.sortBy === 'rate-desc') {
      result.sort((a, b) => b.rate - a.rate);
    } else if (this.sortBy === 'rating-desc') {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    return result;
  }



  // Toggle API details display
  toggleDetails(courierId: number): void {
    const activeSet = new Set(this.expandedCourierIds());
    if (activeSet.has(courierId)) {
      activeSet.delete(courierId);
    } else {
      activeSet.add(courierId);
    }
    this.expandedCourierIds.set(activeSet);
  }

  isExpanded(courierId: number): boolean {
    return this.expandedCourierIds().has(courierId);
  }

  // Helper to extract key-value pairs from raw detail object
  getObjectEntries(obj: any): { key: string, value: any }[] {
    if (!obj) return [];
    
    // Sort keys alphabetically
    return Object.keys(obj).sort().map(key => {
      const value = obj[key];
      let formattedVal = value;
      
      if (typeof value === 'object' && value !== null) {
        formattedVal = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        formattedVal = value ? 'YES' : 'NO';
      }
      
      return { key, value: formattedVal };
    });
  }

  // Visual helper to highlight specific yes or 1 options
  isHighlightable(val: any): boolean {
    const s = String(val).toUpperCase();
    return s === 'YES' || s === 'TRUE' || s === '1';
  }

  // Dynamic helper to extract average days from ETD strings
  getAvgDays(etd: string, hours?: number): string {
    if (hours) {
      const days = Math.round(hours / 24);
      return `${days} Day${days > 1 ? 's' : ''}`;
    }
    const matches = (etd || '').match(/\d+/g);
    if (matches && matches.length > 0) {
      const nums = matches.map(Number);
      const avg = nums.length === 2 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
      return `${avg} Day${avg > 1 ? 's' : ''}`;
    }
    return '3 Days';
  }

  // Dynamic helper to compute RTO delivery days
  getRtoDays(etd: string, hours?: number): string {
    let forwardDays = 3;
    if (hours) {
      forwardDays = Math.round(hours / 24);
    } else {
      const matches = (etd || '').match(/\d+/g);
      if (matches && matches.length > 0) {
        const nums = matches.map(Number);
        forwardDays = nums.length === 2 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
      }
    }
    const rtoDays = Math.round(forwardDays * 1.6);
    return `${rtoDays} Day${rtoDays > 1 ? 's' : ''}`;
  }
}
