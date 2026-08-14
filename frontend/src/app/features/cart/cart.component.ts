import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CartService, CartItem } from "../../core/services/cart.service";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "lk-cart",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"]
})
export class CartComponent implements OnInit {
  readonly cart   = inject(CartService);
  readonly auth   = inject(AuthService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);

  couponCode   = signal("");
  couponError  = signal("");
  couponLoading = signal(false);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.cart.loadFromServer().subscribe();
    }
  }

  increase(item: CartItem): void {
    this.cart.updateQuantity(item.id, item.quantity + 1).subscribe();
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) { this.remove(item); return; }
    this.cart.updateQuantity(item.id, item.quantity - 1).subscribe();
  }

  remove(item: CartItem): void {
    this.cart.removeItem(item.id).subscribe(() => this.toast.info("Item removed from cart"));
  }

  applyCoupon(): void {
    const code = this.couponCode().trim().toUpperCase();
    if (!code) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(["/login"], { queryParams: { returnUrl: "/cart" } });
      return;
    }
    this.couponLoading.set(true);
    this.couponError.set("");
    this.cart.applyCoupon(code).subscribe({
      next: () => { this.couponLoading.set(false); this.toast.success("Coupon applied!"); },
      error: (err: any) => {
        this.couponLoading.set(false);
        this.couponError.set(err?.error?.message ?? "Invalid or expired coupon.");
      }
    });
  }

  removeCoupon(): void { this.cart.removeCoupon(); this.couponCode.set(""); this.couponError.set(""); }

  // Mirrors order.service.ts#createFromCart's discount formula so the
  // preview shown here never overstates the discount the order will get.
  get discount(): number {
    const c = this.cart.appliedCoupon();
    if (!c) return 0;
    if (c.discount_type === "free_shipping") return 0;
    if (c.discount_type === "fixed") return Math.min(c.discount_value, this.cart.subtotal());
    const raw = Math.floor(this.cart.subtotal() * c.discount_value / 100);
    const capped = c.max_discount_amount ? Math.min(raw, c.max_discount_amount) : raw;
    return Math.min(capped, this.cart.subtotal());
  }

  get total(): number { return Math.max(0, this.cart.subtotal() - this.discount); }

  get shippingProgress(): number {
    return Math.min(100, Math.round((this.total / 999) * 100));
  }

  checkout(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(["/login"], { queryParams: { returnUrl: "/checkout" } });
      return;
    }
    this.router.navigate(["/checkout"]);
  }
}