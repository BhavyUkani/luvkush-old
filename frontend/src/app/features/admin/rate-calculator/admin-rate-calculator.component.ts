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
  templateUrl: './admin-rate-calculator.component.html',
  styleUrls: ['./admin-rate-calculator.component.scss'],
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
