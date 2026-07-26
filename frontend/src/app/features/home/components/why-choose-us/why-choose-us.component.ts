import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Reason {
  icon: string | SafeHtml;
  title: string;
  desc: string;
}

@Component({
  selector: 'lk-why-choose-us',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    .wc {
      background: #FFFFFF;
      padding: clamp(2.5rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 3rem);
      position: relative;
    }

    .wc__inner {
      max-width: 1200px;
      margin: 0 auto;
    }

    .wc__header {
      text-align: center;
      margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
    }

    .wc__eyebrow {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #B88447;
      margin: 0 0 0.4rem;
      font-weight: 600;
    }

    .wc__title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 400;
      color: #1E1E1E;
      line-height: 1.2;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .wc__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .wc__grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 540px) {
      .wc__grid { grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
    }

    .wc__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.75rem 1.25rem;
      border: 1px solid #F0F0F0;
      border-radius: 16px;
      background: #FAFAFA;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.25s ease;
    }

    .wc__card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
      border-color: rgba(184, 132, 71, 0.2);
    }

    .wc__card:hover .wc__icon {
      transform: scale(1.08);
    }

    .wc__icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      background: rgba(32, 54, 42, 0.06);
      transition: transform 0.3s ease;

      svg {
        display: block;
        width: 24px;
        height: 24px;
      }
    }

    .wc__card-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: #1E1E1E;
      margin: 0 0 0.375rem;
      line-height: 1.3;
    }

    .wc__card-desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8125rem;
      color: #888;
      line-height: 1.55;
      margin: 0;
    }
  `],
  template: `
    <section class="wc" aria-labelledby="wc-heading">
      <div class="wc__inner">
        <div class="wc__header reveal">
          <p class="wc__eyebrow">Why Luv Kush</p>
          <h2 class="wc__title" id="wc-heading">The Luv Kush Difference</h2>
        </div>

        <div class="wc__grid reveal-stagger">
          @for (reason of reasons; track reason.title) {
            <div class="wc__card">
              <div class="wc__icon" [attr.aria-label]="reason.title">
                <span aria-hidden="true" [innerHTML]="reason.icon"></span>
              </div>
              <h3 class="wc__card-title">{{ reason.title }}</h3>
              <p class="wc__card-desc">{{ reason.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class WhyChooseUsComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  reasons: Reason[] = [
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20362A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 22c1.25-3.12 3.12-5 6.25-6.25M8.25 15.75c3.13-1.25 5-3.13 6.25-6.25M12 2C6.48 2 2 6.48 2 12c0 2.2.72 4.22 1.94 5.86l13.92-13.92C16.22 2.72 14.2 2 12 2z"/>
      </svg>`,
      title: '100% Natural & Herbal',
      desc: 'Ancient botanical formulas. Every ingredient sourced from trusted farms.'
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20362A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.5 16.5c-1.5 1.25-2.5 3-2.5 4.5h20c0-1.5-1-3.25-2.5-4.5M12 2v14M8 5h8M9 9h6"/>
      </svg>`,
      title: 'Zero Harsh Chemicals',
      desc: 'No parabens, sulfates, or synthetic fragrances. Lab verified purity.'
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20362A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 11l2 2 4-4"/>
      </svg>`,
      title: 'Trusted by 10K+ Families',
      desc: 'Over 10,000 happy customers across India trust our products.'
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20362A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>`,
      title: 'Free Delivery ₹499+',
      desc: 'Free shipping on all orders above ₹499. Eco-friendly packaging.'
    }
  ];

  ngOnInit(): void {
    this.reasons = this.reasons.map(r => ({
      ...r,
      icon: this.sanitizer.bypassSecurityTrustHtml(r.icon as string)
    }));
  }
}
