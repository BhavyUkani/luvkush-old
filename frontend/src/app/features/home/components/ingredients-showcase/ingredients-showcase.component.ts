import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Ingredient {
  name: string;
  sanskrit: string;
  latin: string;
  benefit: string;
  detail: string;
  icon: string | SafeHtml;
  bgColor: string;
  accentColor: string;
}

@Component({
  selector: 'lk-ingredients-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    @keyframes shimmerGold {
      0%,100% { background-position: 0% 50%; }
      50%     { background-position: 100% 50%; }
    }

    .is {
      background: linear-gradient(160deg, #20362A 0%, #1a3828 50%, #162b1e 100%);
      padding: clamp(3.5rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 3rem);
      position: relative;
      overflow: hidden;
    }

    /* Dot grid background */
    .is::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(226,201,126,0.05) 1px, transparent 1px);
      background-size: 28px 28px;
      pointer-events: none;
    }

    /* Decorative glow */
    .is::after {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 500px; height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(184,132,71,0.1) 0%, transparent 68%);
      pointer-events: none;
    }

    .is__header {
      text-align: center;
      max-width: 620px;
      margin: 0 auto 1.75rem;
      position: relative;
      z-index: 1;
    }

    .is__eyebrow {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #B88447;
      margin: 0 0 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .is__eyebrow::before, .is__eyebrow::after {
      content: '';
      display: block;
      width: 36px; height: 1px;
      background: #B88447;
      opacity: 0.45;
    }

    .is__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2rem, 4vw, 2.875rem);
      font-weight: 600;
      color: #FAF7F2;
      line-height: 1.15;
      margin: 0 0 1rem;
      letter-spacing: -0.01em;
    }

    .is__title em {
      color: #E2C97E;
      font-style: italic;
    }

    .is__sub {
      font-family: 'Manrope', sans-serif;
      font-size: 0.9375rem;
      color: rgba(250, 247, 242, 0.6);
      line-height: 1.7;
      margin: 0;
    }

    .is__ornament {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      margin: 2rem 0 3rem;
      position: relative;
      z-index: 1;
    }

    .is__ornament-line {
      flex: 1;
      max-width: 80px;
      height: 1px;
      background: rgba(184,132,71,0.35);
    }

    .is__ornament-mark {
      color: rgba(226,201,126,0.6);
      font-size: 0.875rem;
      letter-spacing: 6px;
    }

    .is__grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 1100px) {
      .is__grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 640px) {
      .is__grid { grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
    }

    .is__card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(226, 201, 126, 0.12);
      border-radius: 18px;
      padding: 2rem 1.25rem 1.75rem;
      text-align: center;
      transition:
        transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
        background 0.3s ease,
        border-color 0.3s ease;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      cursor: default;
    }

    .is__card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(226,201,126,0.5), transparent);
      transform: scaleX(0);
      transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      transform-origin: center;
    }

    .is__card:hover {
      transform: translateY(-10px);
      box-shadow: 0 28px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.15);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(226, 201, 126, 0.3);
    }

    .is__card:hover::before { transform: scaleX(1); }

    .is__icon-wrap {
      width: 72px; height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      font-size: 2.25rem;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      
      svg {
        display: block;
        width: 28px;
        height: 28px;
      }
    }

    .is__card:hover .is__icon-wrap {
      transform: scale(1.12) rotate(8deg);
    }

    .is__card-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.4375rem;
      font-weight: 600;
      color: #FAF7F2;
      margin: 0 0 0.25rem;
      line-height: 1.2;
    }

    .is__card-sanskrit {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      color: #E2C97E;
      font-style: italic;
      margin: 0 0 0.2rem;
    }

    .is__card-latin {
      font-family: 'Manrope', sans-serif;
      font-size: 0.6875rem;
      color: rgba(250,247,242,0.4);
      font-style: italic;
      margin: 0 0 1.125rem;
      letter-spacing: 0.02em;
    }

    .is__card-divider {
      width: 32px; height: 1px;
      background: rgba(184,132,71,0.35);
      margin: 0 auto 1rem;
      transition: width 0.35s ease;
    }

    .is__card:hover .is__card-divider { width: 56px; }

    .is__card-benefit {
      font-family: 'Manrope', sans-serif;
      font-size: 0.8125rem;
      font-weight: 600;
      color: rgba(122, 158, 126, 1);
      line-height: 1.5;
      margin: 0 0 0.875rem;
    }

    .is__card-detail {
      font-family: 'Manrope', sans-serif;
      font-size: 0.75rem;
      color: rgba(250, 247, 242, 0.5);
      line-height: 1.7;
      margin: 0;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.45s ease, opacity 0.35s ease 0.05s;
    }

    .is__card:hover .is__card-detail {
      max-height: 140px;
      opacity: 1;
    }
  `],
  template: `
    <section class="is" aria-labelledby="is-heading">
      <div class="is__header reveal">
        <p class="is__eyebrow">Ancient Botanicals</p>
        <h2 class="is__title" id="is-heading">The Wisdom of<br><em>Sacred Ingredients</em></h2>
        <p class="is__sub">Five time-tested botanicals, each revered for centuries in herbal tradition for their transformative hair-care properties.</p>
      </div>

      <div class="is__ornament reveal" aria-hidden="true">
        <span class="is__ornament-line"></span>
        <span class="is__ornament-mark">✦ ✦ ✦</span>
        <span class="is__ornament-line"></span>
      </div>

      <div class="is__grid reveal-stagger">
        @for (ing of ingredients; track ing.name) {
          <div class="is__card">
            <div class="is__icon-wrap" [style.background]="ing.bgColor" [attr.aria-label]="ing.name">
              <span aria-hidden="true" class="is__svg-icon" [innerHTML]="ing.icon"></span>
            </div>
            <p class="is__card-name">{{ ing.name }}</p>
            <p class="is__card-sanskrit">{{ ing.sanskrit }}</p>
            <p class="is__card-latin">{{ ing.latin }}</p>
            <div class="is__card-divider"></div>
            <p class="is__card-benefit">{{ ing.benefit }}</p>
            <p class="is__card-detail">{{ ing.detail }}</p>
          </div>
        }
      </div>
    </section>
  `
})
export class IngredientsShowcaseComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  ingredients: Ingredient[] = [
    {
      name: 'Amla',
      sanskrit: 'आँवला',
      latin: 'Phyllanthus emblica',
      benefit: 'Strengthens follicles, boosts growth',
      detail: 'Rich in Vitamin C and antioxidants, Amla nourishes the scalp deeply and promotes thick, lustrous hair growth from within.',
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A9E7E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 3a9 9 0 0 0 0 18"/>
        <path d="M12 12h9"/>
        <path d="M12 12H3"/>
      </svg>`,
      bgColor: 'rgba(74, 124, 89, 0.18)',
      accentColor: '#7A9E7E'
    },
    {
      name: 'Bhringraj',
      sanskrit: 'भृंगराज',
      latin: 'Eclipta prostrata',
      benefit: 'Prevents greying, revitalises roots',
      detail: 'The "King of Herbs" in traditional herbal science — revitalizes dormant follicles and helps restore natural hair colour over time.',
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A9E7E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 22c1.25-3.12 3.12-5 6.25-6.25M8.25 15.75c3.13-1.25 5-3.13 6.25-6.25M12 2C6.48 2 2 6.48 2 12c0 2.2.72 4.22 1.94 5.86l13.92-13.92C16.22 2.72 14.2 2 12 2z"/>
        <path d="M22 2c-1.25 3.12-3.12 5-6.25 6.25M15.75 8.25c-3.13 1.25-5 3.13-6.25 6.25M12 22c5.52 0 10-4.48 10-10 0-2.2-.72-4.22-1.94-5.86L6.14 20.06c1.64 1.22 3.66 1.94 5.86 1.94z"/>
      </svg>`,
      bgColor: 'rgba(61, 90, 71, 0.18)',
      accentColor: '#7A9E7E'
    },
    {
      name: 'Brahmi',
      sanskrit: 'ब्राह्मी',
      latin: 'Bacopa monnieri',
      benefit: 'Reduces hair fall, calms the scalp',
      detail: 'Strengthens the hair shaft from root to tip, reducing breakage and calming scalp inflammation caused by stress.',
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A9E7E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2z"/>
        <path d="M12 6v12M8 10h8"/>
      </svg>`,
      bgColor: 'rgba(122, 158, 126, 0.2)',
      accentColor: '#7A9E7E'
    },
    {
      name: 'Hibiscus',
      sanskrit: 'जपाकुसुम',
      latin: 'Hibiscus rosa-sinensis',
      benefit: 'Deep conditioning, prevents fall',
      detail: 'Rich in amino acids that nourish the keratin structure of each strand — leaving hair silky, smooth, and resilient.',
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C87A8F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/>
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 6v2M12 16v2M6 12h2M16 12h2"/>
      </svg>`,
      bgColor: 'rgba(168, 66, 101, 0.14)',
      accentColor: '#C87A8F'
    },
    {
      name: 'Neem',
      sanskrit: 'नीम',
      latin: 'Azadirachta indica',
      benefit: 'Purifies scalp, fights dandruff',
      detail: "Neem's antibacterial and antifungal properties create a clean, balanced scalp environment for optimal hair growth.",
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A9E7E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 10l2 2 4-4"/>
      </svg>`,
      bgColor: 'rgba(74, 103, 65, 0.18)',
      accentColor: '#7A9E7E'
    }
  ];

  ngOnInit(): void {
    this.ingredients = this.ingredients.map(ing => ({
      ...ing,
      icon: this.sanitizer.bypassSecurityTrustHtml(ing.icon as string)
    }));
  }
}
