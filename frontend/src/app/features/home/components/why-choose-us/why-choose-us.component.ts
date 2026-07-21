import { Component, ChangeDetectionStrategy, OnInit, ElementRef, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Reason {
  icon: string | SafeHtml;
  title: string;
  desc: string;
  badge: string;
  bgColor: string;
}

@Component({
  selector: 'lk-why-choose-us',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    .wc {
      background: #FFFFFF;
      padding: clamp(3.5rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 3rem);
      position: relative;
      overflow: hidden;
    }

    /* Decorative blobs */
    .wc::before {
      content: '';
      position: absolute;
      top: -60px; right: -80px;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(61,90,71,0.05) 0%, transparent 70%);
      pointer-events: none;
    }

    .wc::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -60px;
      width: 360px; height: 360px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(184,132,71,0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    .wc__header {
      text-align: center;
      max-width: 560px;
      margin: 0 auto 3.5rem;
      position: relative;
      z-index: 1;
    }

    .wc__eyebrow {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #B88447;
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .wc__eyebrow::before, .wc__eyebrow::after {
      content: '';
      display: block;
      width: 36px;
      height: 1px;
      background: #B88447;
      opacity: 0.4;
    }

    .wc__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1.9rem, 3.8vw, 2.75rem);
      font-weight: 600;
      color: #1E1E1E;
      line-height: 1.15;
      margin: 0 0 0.875rem;
      letter-spacing: -0.01em;
    }

    .wc__sub {
      font-family: 'Manrope', sans-serif;
      font-size: 0.9375rem;
      color: #666;
      line-height: 1.65;
      margin: 0;
    }

    .wc__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 1024px) {
      .wc__grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 540px) {
      .wc__grid { grid-template-columns: 1fr; gap: 1rem; }
    }

    .wc__card {
      padding: 2.25rem 1.75rem;
      border: 1px solid #EFEFEF;
      border-radius: 20px;
      text-align: center;
      background: linear-gradient(160deg, #FFFFFF 0%, #FAF7F2 100%);
      transition:
        transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.38s cubic-bezier(0.22, 1, 0.36, 1),
        border-color 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .wc__card::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #B88447 0%, #E2C97E 50%, #B88447 100%);
      transform: scaleX(0);
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      transform-origin: center;
    }

    .wc__card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px rgba(32, 54, 42, 0.1), 0 4px 16px rgba(32, 54, 42, 0.06);
      border-color: rgba(184, 132, 71, 0.25);
    }

    .wc__card:hover::after { transform: scaleX(1); }

    .wc__icon {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.375rem;
      font-size: 2.25rem;
      position: relative;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

      svg {
        display: block;
        width: 28px;
        height: 28px;
      }
    }

    .wc__card:hover .wc__icon {
      transform: scale(1.1) rotate(6deg);
    }

    .wc__card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3125rem;
      font-weight: 600;
      color: #20362A;
      margin: 0 0 0.625rem;
      line-height: 1.25;
    }

    .wc__card-desc {
      font-family: 'Manrope', sans-serif;
      font-size: 0.875rem;
      color: #666;
      line-height: 1.65;
      margin: 0;
    }

    .wc__badge {
      display: inline-block;
      margin-top: 1.125rem;
      padding: 0.3rem 0.875rem;
      background: linear-gradient(135deg, rgba(184,132,71,0.12), rgba(226,201,126,0.1));
      border: 1px solid rgba(184, 132, 71, 0.25);
      border-radius: 99px;
      font-family: 'Manrope', sans-serif;
      font-size: 0.6875rem;
      font-weight: 600;
      color: #B88447;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  `],
  template: `
    <section class="wc" aria-labelledby="wc-heading">
      <div class="wc__header reveal">
        <p class="wc__eyebrow">The Luv Kush Difference</p>
        <h2 class="wc__title" id="wc-heading">Why Choose Luv Kush Natural</h2>
        <p class="wc__sub">We combine the purity of ancient herbal wisdom with the rigour of modern quality standards.</p>
      </div>

      <div class="wc__grid reveal-stagger">
        @for (reason of reasons; track reason.title) {
          <div class="wc__card">
            <div class="wc__icon" [style.background]="reason.bgColor" [attr.aria-label]="reason.title">
              <span aria-hidden="true" class="wc__svg-icon" [innerHTML]="reason.icon"></span>
            </div>
            <h3 class="wc__card-title">{{ reason.title }}</h3>
            <p class="wc__card-desc">{{ reason.desc }}</p>
            <span class="wc__badge">{{ reason.badge }}</span>
          </div>
        }
      </div>
    </section>
  `
})
export class WhyChooseUsComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  reasons: Reason[] = [
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E503B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 22c1.25-3.12 3.12-5 6.25-6.25M8.25 15.75c3.13-1.25 5-3.13 6.25-6.25M12 2C6.48 2 2 6.48 2 12c0 2.2.72 4.22 1.94 5.86l13.92-13.92C16.22 2.72 14.2 2 12 2z"/>
      </svg>`,
      title: '100% Natural & Herbal',
      desc: 'Ancient botanical formulas perfected over generations. Every ingredient sourced from trusted farms across India.',
      badge: 'No Compromise',
      bgColor: 'rgba(54, 80, 59, 0.1)'
    },
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D3E35" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.5 16.5c-1.5 1.25-2.5 3-2.5 4.5h20c0-1.5-1-3.25-2.5-4.5M12 2v14M8 5h8M9 9h6"/>
      </svg>`,
      title: 'Zero Harmful Chemicals',
      desc: 'Free from parabens, sulfates, mineral oils and synthetic fragrances. What you see on the label is what goes on your scalp.',
      badge: 'Lab Verified',
      bgColor: 'rgba(61, 90, 71, 0.1)'
    },
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B6434" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 11l2 2 4-4"/>
      </svg>`,
      title: 'Trusted by Families',
      desc: 'Over 10,000 happy customers — from first-time buyers to multi-generational households who swear by our oils.',
      badge: '10,000+ Orders',
      bgColor: 'rgba(184, 132, 71, 0.1)'
    },
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#20362A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>`,
      title: 'Free Delivery',
      desc: 'Free shipping on all orders above ₹499. Safe, eco-friendly packaging. Delivered to your door across India.',
      badge: 'Above ₹499',
      bgColor: 'rgba(32, 54, 42, 0.08)'
    }
  ];

  ngOnInit(): void {
    this.reasons = this.reasons.map(r => ({
      ...r,
      icon: this.sanitizer.bypassSecurityTrustHtml(r.icon as string)
    }));
  }
}
