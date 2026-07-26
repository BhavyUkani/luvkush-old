import {
  Component, OnInit, OnDestroy, HostListener,
  ChangeDetectionStrategy, inject, PLATFORM_ID, signal
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
  label: string;
  path: string;
  queryParams?: Record<string, string>;
  badge?: string;
  children?: NavItem[];
}

@Component({
  selector: 'lk-navigation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router     = inject(Router);
  readonly cartService         = inject(CartService);
  readonly wishlistService     = inject(WishlistService);
  readonly auth                = inject(AuthService);

  isScrolled     = signal(false);
  isMobileOpen   = signal(false);
  activeDropdown = signal<string | null>(null);
  showUserMenu   = signal(false);
  searchOpen     = signal(false);
  searchQuery    = '';

  readonly announcementMessages = [
    '🌿 Free Pan-India Delivery on orders above ₹499',
    '✨ 100% Authentic Cold-Pressed Ayurvedic Formulations',
    '🎁 Special Offer: Use code NATURAL10 for 10% OFF your first order',
    '✂️ Free Custom Fitting & Consultation for Hair Wigs & Patches'
  ];
  announcementIndex = signal(0);
  private announcementTimer: ReturnType<typeof setInterval> | null = null;

  readonly navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    {
      label: 'Shop All',
      path: '/shop',
      children: [
        { label: 'All Products', path: '/shop' },
        { label: 'Hair Growth Oils', path: '/shop', queryParams: { category: 'hair-growth-oils' } },
        { label: 'Herbal Shampoos', path: '/shop', queryParams: { category: 'herbal-shampoos' } },
        { label: 'Scalp & Hair Serums', path: '/shop', queryParams: { category: 'scalp-hair-serums' } },
        { label: 'Nourishing Hair Masks', path: '/shop', queryParams: { category: 'nourishing-hair-masks' } },
        { label: 'Best Sellers', path: '/shop', queryParams: { sort: 'sales_count' } },
        { label: 'New Arrivals', path: '/shop', queryParams: { sort: 'created_at' } },
      ]
    },
    {
      label: 'Hair Wigs',
      path: '/hair-wigs'
    },
    {
      label: 'Hair Patches',
      path: '/hair-patches'
    },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  toggleSearch(): void {
    this.searchOpen.update(v => !v);
    if (this.searchOpen() && isPlatformBrowser(this.platformId)) {
      setTimeout(() => (document.querySelector('.nav__search-input') as HTMLInputElement)?.focus(), 50);
    }
  }

  closeSearch(): void {
    this.searchOpen.set(false);
    this.searchQuery = '';
  }

  submitSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.closeSearch();
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 40);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.announcementTimer = setInterval(() => {
        this.announcementIndex.update(i => (i + 1) % this.announcementMessages.length);
      }, 4500);
    }
  }

  ngOnDestroy(): void {
    if (this.announcementTimer) clearInterval(this.announcementTimer);
  }

  toggleMobile(): void {
    this.isMobileOpen.update(v => !v);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMobileOpen() ? 'hidden' : '';
    }
  }

  openDropdown(label: string): void {
    this.activeDropdown.set(label);
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
    this.showUserMenu.set(false);
    this.router.navigate(['/']);
  }
}
