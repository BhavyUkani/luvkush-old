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
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss'],
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
