import {
  Component, OnInit, ChangeDetectionStrategy, inject, signal, afterNextRender, CUSTOM_ELEMENTS_SCHEMA
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { ProductApiService, Product } from "../../../../core/services/product-api.service";
import { CartService } from "../../../../core/services/cart.service";
import { WishlistService } from "../../../../core/services/wishlist.service";
import { AuthService } from "../../../../core/services/auth.service";
import { imageUrl } from "../../../../shared/utils/image-url";

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  tag?: string;
  desktopImage: string;
  mobileImage?: string;
  linkUrl: string;
  ctaText?: string;
  badge?: string;
  product?: Product;
}

@Component({
  selector: "lk-hero",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: "./hero.component.html",
  styleUrls: ["./hero.component.scss"],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeroComponent implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly cart       = inject(CartService);
  private readonly auth       = inject(AuthService);
  private readonly router     = inject(Router);
  readonly wishlist            = inject(WishlistService);

  loading     = signal(true);
  swiperReady = signal(false);
  readonly imgUrl = imageUrl;

  slides = signal<HeroSlide[]>([
    {
      id: 1,
      title: '100% Natural Ayurvedic Hair Care',
      subtitle: 'Rooted in 5000 years of herbal wisdom. Cold-pressed oils & pure botanical formulations.',
      tag: 'Bestseller',
      badge: 'Free Shipping Above ₹499',
      desktopImage: '/assets/images/hero-image-1.png',
      mobileImage: '/assets/images/hero-image-1.png',
      linkUrl: '/shop',
      ctaText: 'Shop All Products'
    },
    {
      id: 2,
      title: 'Bhringraj Intense Hair Growth Oil',
      subtitle: '48-Hour slow cooked herbal oil to stop hair fall & activate dormant follicles.',
      tag: 'Ayurvedic Elixir',
      badge: 'Up to 30% OFF',
      desktopImage: '/assets/images/ayurvedic_hair_oil.png',
      mobileImage: '/assets/images/ayurvedic_hair_oil.png',
      linkUrl: '/shop?category=hair-growth-oils',
      ctaText: 'Explore Hair Oils'
    },
    {
      id: 3,
      title: 'Undetectable Premium Human Hair Wigs',
      subtitle: 'Seamless HD Swiss lace fronts, 100% virgin hair, custom-crafted for you.',
      tag: 'Premium Hair Wigs',
      badge: 'Custom Fitted',
      desktopImage: '/assets/images/premium_hair_wig.png',
      mobileImage: '/assets/images/premium_hair_wig.png',
      linkUrl: '/hair-wigs',
      ctaText: 'Discover Hair Wigs'
    },
    {
      id: 4,
      title: '0.03mm Micro Thin Skin Hair Patches',
      subtitle: 'Waterproof, breathable hairline patches for instant natural density.',
      tag: 'Custom Hair Systems',
      badge: 'Instant Results',
      desktopImage: '/assets/images/hair_patch.png',
      mobileImage: '/assets/images/hair_patch.png',
      linkUrl: '/hair-patches',
      ctaText: 'Explore Hair Patches'
    }
  ]);

  constructor() {
    afterNextRender(() => {
      import('swiper/element/bundle').then(({ register }) => {
        register();
        this.swiperReady.set(true);
      });
    });
  }

  ngOnInit(): void {
    // Optionally augment slides with live product data if available
    this.productApi.getBestSellers(4).subscribe({
      next: (res) => {
        const prods = res.data ?? [];
        if (prods.length > 0) {
          this.slides.update(current => current.map((slide, idx) => {
            if (prods[idx]) {
              return {
                ...slide,
                product: prods[idx]
              };
            }
            return slide;
          }));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSlideClick(slide: HeroSlide, event: MouseEvent): void {
    // Prevent double trigger if user clicked directly on an interactive button/link
    const target = event.target as HTMLElement;
    if (target.closest('.hero__btn-action') || target.closest('a')) {
      return;
    }
    if (slide.linkUrl) {
      this.router.navigateByUrl(slide.linkUrl);
    }
  }
}
