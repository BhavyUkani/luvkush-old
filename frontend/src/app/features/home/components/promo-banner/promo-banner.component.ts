import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lk-promo-banner',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    .promo {
      background: linear-gradient(135deg, #20362A 0%, #2a4a36 40%, #1a3020 100%);
      padding: clamp(2.5rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 3rem);
      position: relative;
      overflow: hidden;
    }

    /* Decorative accent */
    .promo::before {
      content: '';
      position: absolute;
      top: -60%;
      right: -5%;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(226, 201, 126, 0.1) 0%, transparent 60%);
      pointer-events: none;
    }

    .promo::after {
      content: '';
      position: absolute;
      bottom: -40%;
      left: -8%;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(184, 132, 71, 0.08) 0%, transparent 60%);
      pointer-events: none;
    }

    .promo__inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
    }

    .promo__content {
      flex: 1;
      min-width: 280px;
    }

    .promo__eyebrow {
      font-family: 'Outfit', sans-serif;
      font-size: 10.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #E2C97E;
      margin: 0 0 0.625rem;
      font-weight: 600;
    }

    .promo__title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 400;
      color: #FAF7F2;
      line-height: 1.2;
      margin: 0 0 0.5rem;
      letter-spacing: -0.01em;
    }

    .promo__desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9375rem;
      color: rgba(250, 247, 242, 0.6);
      line-height: 1.55;
      margin: 0;
    }

    .promo__badges {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      flex-wrap: wrap;
    }

    .promo__badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
      text-align: center;
    }

    .promo__badge-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(226, 201, 126, 0.12);
      border: 1px solid rgba(226, 201, 126, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #E2C97E;
      transition: transform 0.3s ease, background 0.3s ease;
    }

    .promo__badge:hover .promo__badge-icon {
      transform: scale(1.1);
      background: rgba(226, 201, 126, 0.18);
    }

    .promo__badge-text {
      font-family: 'Outfit', sans-serif;
      font-size: 0.6875rem;
      font-weight: 600;
      color: rgba(250, 247, 242, 0.75);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .promo__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.75rem;
      background: linear-gradient(135deg, #B88447, #E2C97E);
      color: #1a1208;
      border-radius: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.8125rem;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: 0.03em;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 16px rgba(184, 132, 71, 0.3);
      flex-shrink: 0;
    }

    .promo__cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(184, 132, 71, 0.4);
    }

    .promo__cta svg {
      transition: transform 0.2s ease;
    }

    .promo__cta:hover svg {
      transform: translateX(3px);
    }

    @media (max-width: 768px) {
      .promo__inner {
        flex-direction: column;
        text-align: center;
      }
      .promo__badges {
        justify-content: center;
      }
      .promo__content {
        min-width: auto;
      }
    }
  `],
  template: `
    <section class="promo" aria-label="Special offers">
      <div class="promo__inner">
        <div class="promo__content">
          <p class="promo__eyebrow">Special Offers</p>
          <h2 class="promo__title">Free Delivery on Orders Above ₹499</h2>
          <p class="promo__desc">100% Natural. No chemicals. Trusted by 10,000+ families across India.</p>
        </div>

        <div class="promo__badges">
          <div class="promo__badge">
            <div class="promo__badge-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 11l2 2 4-4"/>
              </svg>
            </div>
            <span class="promo__badge-text">Lab Verified</span>
          </div>
          <div class="promo__badge">
            <div class="promo__badge-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C12 2 8 6.5 5 10C8 14 12 20 12 20C12 20 16 14 19 10C16 6.5 12 2 12 2Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span class="promo__badge-text">100% Herbal</span>
          </div>
          <div class="promo__badge">
            <div class="promo__badge-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="6" width="14" height="12" rx="2"/>
                <path d="M15 10H19L22 13V18H15V10Z"/>
                <circle cx="5" cy="20" r="2"/>
                <circle cx="18" cy="20" r="2"/>
              </svg>
            </div>
            <span class="promo__badge-text">Free Delivery</span>
          </div>
        </div>

        <a class="promo__cta" routerLink="/shop">
          Shop Now
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  `
})
export class PromoBannerComponent {}
