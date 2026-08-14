import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { imageUrl } from '../../shared/utils/image-url';

export interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  name: string;
  variant?: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  slug: string;
  payment_mode?: string;
  advance_amount?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  private _guestIdCounter = 0;
  private _items = signal<CartItem[]>(this.loadFromStorage());
  private _appliedCoupon = signal<any>(null);
  private _loading = signal(false);

  readonly items = this._items.asReadonly();
  readonly appliedCoupon = this._appliedCoupon.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    // Otherwise the next person on this browser (or this same tab, post
    // logout) inherits whatever the previous account left in the cart.
    this.auth.loggedOut$.subscribe(() => this.clearCart());
  }
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));
  readonly savings = computed(() => this._items().reduce((sum, i) => sum + (i.mrp - i.price) * i.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  loadFromServer(): Observable<any> {
    if (!this.auth.isLoggedIn()) return of(null);
    this._loading.set(true);
    return this.mergeGuestCart().pipe(
      switchMap(() => this.api.get('/cart')),
      tap((res: any) => {
        if (res.data) {
          this.syncFromServer(res.data);
        }
        this._loading.set(false);
      }),
      catchError(() => { this._loading.set(false); return of(null); })
    );
  }

  /** Pushes any items added while logged out onto the now-authenticated
   * server cart before the first post-login sync overwrites local state —
   * otherwise a guest who fills a cart and then logs in loses it outright. */
  private mergeGuestCart(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) return of(null);
    let guestItems: CartItem[] = [];
    try {
      const stored = localStorage.getItem('lk_cart');
      guestItems = stored ? JSON.parse(stored) : [];
    } catch { guestItems = []; }
    if (!guestItems.length) return of(null);

    try { localStorage.removeItem('lk_cart'); } catch { /* ignore */ }

    const requests = guestItems.map(item =>
      this.api.post('/cart/items', {
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity
      }).pipe(catchError(() => of(null)))
    );
    return forkJoin(requests);
  }

  addItem(item: Omit<CartItem, 'id'>): Observable<any> {
    if (this.auth.isLoggedIn()) {
      return this.api.post('/cart/items', {
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity
      }).pipe(
        tap((res: any) => { if (res.data) this.syncFromServer(res.data); }),
        catchError((err) => {
          // A server rejection (e.g. "only 2 units available") must not be
          // papered over by silently adding the item locally — that leaves
          // the customer with a cart the server doesn't agree with.
          this.toast.error(err?.userMessage ?? 'Could not add item to cart');
          return of(null);
        })
      );
    }
    this.addToLocal(item);
    return of(null);
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    if (this.auth.isLoggedIn()) {
      if (quantity <= 0) return this.removeItem(itemId);
      return this.api.put(`/cart/items/${itemId}`, { quantity }).pipe(
        tap((res: any) => { if (res.data) this.syncFromServer(res.data); }),
        catchError((err) => {
          this.toast.error(err?.userMessage ?? 'Could not update quantity');
          return of(null);
        })
      );
    }
    if (quantity <= 0) {
      this._items.update(items => items.filter(i => i.id !== itemId));
    } else {
      this._items.update(items => items.map(i => i.id === itemId ? { ...i, quantity } : i));
    }
    this.saveToStorage();
    return of(null);
  }

  removeItem(itemId: number): Observable<any> {
    if (this.auth.isLoggedIn()) {
      return this.api.delete(`/cart/items/${itemId}`).pipe(
        tap((res: any) => { if (res.data) this.syncFromServer(res.data); }),
        catchError((err) => {
          this.toast.error(err?.userMessage ?? 'Could not remove item');
          return of(null);
        })
      );
    }
    this._items.update(items => items.filter(i => i.id !== itemId));
    this.saveToStorage();
    return of(null);
  }

  applyCoupon(code: string): Observable<any> {
    if (!this.auth.isLoggedIn()) return of(null);
    return this.api.post('/cart/coupon', { code }).pipe(
      tap((res: any) => {
        if (res.data?.coupon) {
          this._appliedCoupon.set(res.data.coupon);
        }
      })
    );
  }

  removeCoupon(): void {
    this._appliedCoupon.set(null);
  }

  clearCart(): void {
    this._items.set([]);
    this._appliedCoupon.set(null);
    if (isPlatformBrowser(this.platformId)) {
      try { localStorage.removeItem('lk_cart'); } catch { /* ignore */ }
    }
    if (this.auth.isLoggedIn()) {
      this.api.delete('/cart').pipe(catchError(() => of(null))).subscribe();
    }
  }

  private addToLocal(item: Omit<CartItem, 'id'>): void {
    this._items.update(items => {
      const existing = items.find(i =>
        i.productId === item.productId && i.variantId === item.variantId
      );
      if (existing) {
        return items.map(i =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      // A counter suffix avoids collisions between two items added within
      // the same millisecond, which Date.now() alone can't distinguish.
      const id = Date.now() * 1000 + (this._guestIdCounter++ % 1000);
      return [...items, { ...item, id, quantity: item.quantity || 1, payment_mode: item.payment_mode || 'full_cod', advance_amount: item.advance_amount ?? null }];
    });
    this.saveToStorage();
  }

  private syncFromServer(data: any): void {
    const items: CartItem[] = (data.items || []).map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      variantId: i.variant_id,
      name: i.name,
      variant: i.variant_name,
      price: i.variant_id ? i.price + (i.price_modifier || 0) : i.price,
      mrp: i.mrp,
      quantity: i.quantity,
      image: imageUrl(i.primary_image),
      slug: i.slug,
      payment_mode: i.payment_mode || 'full_cod',
      advance_amount: i.advance_amount ? Number(i.advance_amount) : null
    }));
    this._items.set(items);
    this.saveToStorage();
  }

  private loadFromStorage(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const stored = localStorage.getItem('lk_cart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem('lk_cart', JSON.stringify(this._items()));
    } catch { /* ignore */ }
  }
}
