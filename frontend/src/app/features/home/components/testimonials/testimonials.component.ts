import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Testimonial {
  quote: string;
  name: string;
  city: string;
  product: string;
  initials: string;
  rating: number;
  avatarBg: string;
}

@Component({
  selector: 'lk-testimonials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes marqueeScroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    .tm {
      background: linear-gradient(160deg, #FAF7F2 0%, #F1E8D8 50%, #EDE0CC 100%);
      padding: clamp(3.5rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 3rem);
      position: relative;
      overflow: hidden;
    }

    /* Top accent border */
    .tm::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #B88447 30%, #E2C97E 50%, #B88447 70%, transparent);
    }

    /* Background circle decoration */
    .tm::after {
      content: '';
      position: absolute;
      top: -120px; right: -100px;
      width: 500px; height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(184,132,71,0.07) 0%, transparent 70%);
      pointer-events: none;
    }

    .tm__header {
      text-align: center;
      max-width: 540px;
      margin: 0 auto 3.5rem;
      position: relative;
      z-index: 1;
    }

    .tm__eyebrow {
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

    .tm__eyebrow::before, .tm__eyebrow::after {
      content: '';
      display: block;
      width: 36px; height: 1px;
      background: #B88447;
      opacity: 0.4;
    }

    .tm__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 600;
      color: #1E1E1E;
      line-height: 1.18;
      margin: 0 0 0.875rem;
      letter-spacing: -0.01em;
    }

    .tm__sub {
      font-family: 'Manrope', sans-serif;
      font-size: 0.9375rem;
      color: #666;
      line-height: 1.65;
      margin: 0;
    }

    /* ─── Grid of cards ─────────────────────────────────────── */
    .tm__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 900px) {
      .tm__grid { grid-template-columns: 1fr; max-width: 520px; }
    }

    .tm__card {
      background: rgba(255,255,255,0.75);
      border: 1px solid rgba(184,132,71,0.12);
      border-radius: 20px;
      padding: 2.25rem 1.875rem;
      position: relative;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                  box-shadow 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                  border-color 0.25s ease;
      overflow: hidden;
    }

    .tm__card::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #B88447 0%, #E2C97E 50%, #B88447 100%);
      transform: scaleX(0);
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      transform-origin: left;
    }

    .tm__card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 64px rgba(32, 54, 42, 0.1), 0 4px 16px rgba(32, 54, 42, 0.06);
      border-color: rgba(184, 132, 71, 0.3);
    }

    .tm__card:hover::after { transform: scaleX(1); }

    .tm__quote-mark {
      font-family: 'Cormorant Garamond', serif;
      font-size: 5.5rem;
      line-height: 0.8;
      color: #E2C97E;
      opacity: 0.35;
      position: absolute;
      top: 1rem;
      left: 1.625rem;
      pointer-events: none;
      user-select: none;
    }

    .tm__stars {
      display: flex;
      gap: 0.2rem;
      margin-bottom: 1.25rem;
      margin-top: 0.75rem;
    }

    .tm__star {
      color: #C8891A;
      font-size: 0.9375rem;
    }

    .tm__quote {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.125rem;
      color: #2D2D2D;
      line-height: 1.72;
      font-style: italic;
      margin: 0 0 1.75rem;
    }

    .tm__divider {
      height: 1px;
      background: linear-gradient(90deg, rgba(184,132,71,0.2) 0%, transparent 100%);
      margin-bottom: 1.375rem;
    }

    .tm__author {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .tm__avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Manrope', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: #E2C97E;
      flex-shrink: 0;
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
      transition: transform 0.3s ease;
    }

    .tm__card:hover .tm__avatar {
      transform: scale(1.08);
    }

    .tm__author-name {
      font-family: 'Manrope', sans-serif;
      font-size: 0.9375rem;
      font-weight: 700;
      color: #1E1E1E;
      margin: 0 0 0.1875rem;
    }

    .tm__author-meta {
      font-family: 'Manrope', sans-serif;
      font-size: 0.75rem;
      color: #888;
      margin: 0;
    }

    .tm__verified {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.3rem;
      font-family: 'Manrope', sans-serif;
      font-size: 0.6875rem;
      color: #3D5A47;
      font-weight: 600;
    }

    .tm__verified svg { flex-shrink: 0; }

    /* ─── Rating strip ────────────────────────────────────────── */
    .tm__strip {
      margin-top: 3.5rem;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .tm__strip-inner {
      display: inline-flex;
      align-items: center;
      gap: 2rem;
      background: rgba(255,255,255,0.6);
      border: 1px solid rgba(184,132,71,0.15);
      border-radius: 99px;
      padding: 1rem 2.5rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      flex-wrap: wrap;
      justify-content: center;
    }

    .tm__strip-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tm__strip-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #20362A;
      line-height: 1;
    }

    .tm__strip-label {
      font-family: 'Manrope', sans-serif;
      font-size: 0.75rem;
      color: #888;
    }

    .tm__strip-sep {
      width: 1px;
      height: 36px;
      background: rgba(184,132,71,0.2);
    }
  `],
  template: `
    <section class="tm" aria-labelledby="tm-heading">
      <div class="tm__header reveal">
        <p class="tm__eyebrow">Real Results</p>
        <h2 class="tm__title" id="tm-heading">Transformations That<br>Speak for Themselves</h2>
        <p class="tm__sub">Thousands of happy customers trust Luv Kush Natural for their daily hair care rituals.</p>
      </div>

      <div class="tm__grid reveal-stagger">
        @for (t of testimonials; track t.name) {
          <div class="tm__card">
            <span class="tm__quote-mark" aria-hidden="true">"</span>
            <div class="tm__stars" [attr.aria-label]="t.rating + ' out of 5 stars'">
              @for (s of starArray(t.rating); track $index) {
                <span class="tm__star" aria-hidden="true">★</span>
              }
            </div>
            <p class="tm__quote">{{ t.quote }}</p>
            <div class="tm__divider"></div>
            <div class="tm__author">
              <div class="tm__avatar" [style.background]="t.avatarBg" [attr.aria-label]="t.name">{{ t.initials }}</div>
              <div>
                <p class="tm__author-name">{{ t.name }}</p>
                <p class="tm__author-meta">{{ t.city }} · {{ t.product }}</p>
                <span class="tm__verified">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <circle cx="6" cy="6" r="6" fill="#3D5A47"/>
                    <path d="M3.5 6L5.5 8L8.5 4.5" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Verified Purchase
                </span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Social proof strip -->
      <div class="tm__strip reveal">
        <div class="tm__strip-inner">
          <div class="tm__strip-stat">
            <span class="tm__strip-num">4.9</span>
            <span class="tm__strip-label">Average Rating</span>
          </div>
          <div class="tm__strip-sep" aria-hidden="true"></div>
          <div class="tm__strip-stat">
            <span class="tm__strip-num">10K+</span>
            <span class="tm__strip-label">Happy Customers</span>
          </div>
          <div class="tm__strip-sep" aria-hidden="true"></div>
          <div class="tm__strip-stat">
            <span class="tm__strip-num">98%</span>
            <span class="tm__strip-label">Would Recommend</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TestimonialsComponent {
  readonly testimonials: Testimonial[] = [
    {
      quote: "I have been using Luv Kush Natural Bhringraj oil for three months now. My hair fall has reduced dramatically and my scalp feels healthier than it has in years. Truly pure natural quality.",
      name: "Priya Mehta",
      city: "Mumbai",
      product: "Bhringraj Hair Oil",
      initials: "PM",
      rating: 5,
      avatarBg: "linear-gradient(135deg, #36503B, #20362A)"
    },
    {
      quote: "The Amla & Brahmi oil is nothing short of miraculous. Thick, aromatic, and it works. My mother used to make something similar at home — this is even better. Will order again without hesitation.",
      name: "Rajesh Sharma",
      city: "Jaipur",
      product: "Amla & Brahmi Oil",
      initials: "RS",
      rating: 5,
      avatarBg: "linear-gradient(135deg, #B88447, #8B6434)"
    },
    {
      quote: "Ordered the hair wig for my mother who was struggling with hair loss. The quality and natural hairline are absolutely unmatched for this price. Excellent packaging and fast delivery too.",
      name: "Anjali Verma",
      city: "Delhi",
      product: "Premium Hair Wig",
      initials: "AV",
      rating: 5,
      avatarBg: "linear-gradient(135deg, #6B3A2A, #4A2018)"
    }
  ];

  starArray(count: number): number[] {
    return Array(count).fill(0);
  }
}
