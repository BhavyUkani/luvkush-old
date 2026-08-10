import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/services/product-api.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { imageUrl } from '../../utils/image-url';

@Component({
  selector: 'lk-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  // Grid mode's media is a full-width square (aspect-ratio 1/1 at 100% of
  // the card). In a single-column list, that square would scale to the
  // width of the whole row — a thumbnail becomes a wall-sized photo. List
  // mode switches the card to a row and gives the media a fixed width instead.
  @Input() layout: 'grid' | 'list' = 'grid';

  readonly wishlist = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  isAdded = signal(false);

  get discount(): number {
    if (!this.product.mrp || this.product.mrp <= this.product.price) return 0;
    return Math.round(((this.product.mrp - this.product.price) / this.product.mrp) * 100);
  }

  get ratingInt(): number {
    return Math.round(this.product.rating_avg ?? 0);
  }

  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get imageUrl(): string {
    return imageUrl(this.product.primary_image);
  }

  get hoverImage(): string | null {
    if (!this.product.images) return null;
    try {
      const imgs: string[] = typeof this.product.images === 'string'
        ? JSON.parse(this.product.images)
        : this.product.images as string[];
      return imgs?.[0] ? imageUrl(imgs[0]) : null;
    } catch { return null; }
  }

  get isLowStock(): boolean {
    const qty = this.product.stock_quantity;
    return qty != null && qty > 0 && qty <= 5;
  }

  get stockCount(): number {
    return this.product.stock_quantity ?? 0;
  }

  get paymentLabel(): string | null {
    const mode = this.product.payment_mode;
    if (!mode || mode === 'hybrid') return 'COD Available';
    if (mode === 'full_cod') return 'COD Available';
    if (mode === 'full_online') return 'Online Only';
    if (mode === 'partial') {
      const adv = this.product.advance_amount;
      return adv ? `Advance ₹${adv}` : 'Advance Required';
    }
    return null;
  }

  get productUrl(): any[] {
    const sub = (this.product.subtitle || '').toLowerCase();
    const cat = (this.product.category_slug || '').toLowerCase();
    const name = (this.product.name || '').toLowerCase();

    if (cat.includes('wig') || sub.includes('wig') || cat === 'hair-solutions-mens' || cat === 'hair-solutions-ladies') {
      return ['/hair-wigs', this.product.slug];
    }
    if (cat.includes('patch') || sub.includes('patch') || cat === 'hair-solutions-patches') {
      return ['/hair-patches', this.product.slug];
    }
    // Fallback based on name just in case
    if (name.includes('wig')) {
      return ['/hair-wigs', this.product.slug];
    }
    if (name.includes('patch')) {
      return ['/hair-patches', this.product.slug];
    }
    return ['/products', this.product.slug];
  }

  navigateToProduct(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.pc__wish') || target.closest('.pc__action-btn')) {
      return;
    }
    this.router.navigate(this.productUrl);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${this.product.slug}` } });
      return;
    }
    this.cartService.addItem({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      mrp: this.product.mrp,
      quantity: 1,
      image: this.product.primary_image || '',
      slug: this.product.slug
    }).subscribe();
    this.isAdded.set(true);
    setTimeout(() => this.isAdded.set(false), 2000);
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${this.product.slug}` } });
      return;
    }
    this.wishlist.toggle(this.product).subscribe();
  }
}
