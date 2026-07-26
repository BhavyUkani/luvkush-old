import { Component, ChangeDetectionStrategy } from '@angular/core';

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

    .tm {
      background: #F7F8FA;
      padding: clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 4vw, 3rem);
      position: relative;
    }

    .tm__header {
      text-align: center;
      max-width: 500px;
      margin: 0 auto clamp(1.5rem, 3vw, 2.5rem);
    }

    .tm__eyebrow {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #B88447;
      margin: 0 0 0.4rem;
      font-weight: 600;
    }

    .tm__title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-weight: 400;
      color: #1E1E1E;
      line-height: 1.2;
      margin: 0 0 0.5rem;
      letter-spacing: -0.01em;
    }

    .tm__sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      color: #888;
      line-height: 1.55;
      margin: 0;
    }

    /* ─── Grid ─────────────────────────────────────── */
    .tm__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    @media (max-width: 900px) {
      .tm__grid { grid-template-columns: 1fr; max-width: 520px; }
    }

    .tm__card {
      background: #FFFFFF;
      border: 1px solid #F0F0F0;
      border-radius: 16px;
      padding: 1.75rem 1.5rem;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.25s ease;
    }

    .tm__card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
      border-color: rgba(184, 132, 71, 0.2);
    }

    .tm__stars {
      display: flex;
      gap: 0.15rem;
      margin-bottom: 1rem;
    }

    .tm__star {
      color: #C8891A;
      font-size: 0.875rem;
    }

    .tm__quote {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9375rem;
      color: #333;
      line-height: 1.65;
      margin: 0 0 1.25rem;
    }

    .tm__divider {
      height: 1px;
      background: #F0F0F0;
      margin-bottom: 1rem;
    }

    .tm__author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .tm__avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #E2C97E;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .tm__card:hover .tm__avatar {
      transform: scale(1.06);
    }

    .tm__author-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: #1E1E1E;
      margin: 0 0 0.125rem;
    }

    .tm__author-meta {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      color: #888;
      margin: 0;
    }

    .tm__verified {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.2rem;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.6875rem;
      color: #3D5A47;
      font-weight: 600;
    }

    .tm__verified svg { flex-shrink: 0; }

    /* ─── Social proof strip ──────────────────────── */
    .tm__strip {
      margin-top: 2.5rem;
      text-align: center;
    }

    .tm__strip-inner {
      display: inline-flex;
      align-items: center;
      gap: 2rem;
      background: #FFFFFF;
      border: 1px solid #F0F0F0;
      border-radius: 99px;
      padding: 0.875rem 2rem;
      flex-wrap: wrap;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .tm__strip-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tm__strip-num {
      font-family: 'DM Serif Display', serif;
      font-size: 1.5rem;
      font-weight: 400;
      color: #20362A;
      line-height: 1;
    }

    .tm__strip-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.6875rem;
      color: #888;
    }

    .tm__strip-sep {
      width: 1px;
      height: 28px;
      background: #F0F0F0;
    }
  `],
  template: `
    <section class="tm" aria-labelledby="tm-heading">
      <div class="tm__header reveal">
        <p class="tm__eyebrow">Real Results</p>
        <h2 class="tm__title" id="tm-heading">What Our Customers Say</h2>
        <p class="tm__sub">Thousands of happy customers trust Luv Kush Natural for their daily hair care.</p>
      </div>

      <div class="tm__grid reveal-stagger">
        @for (t of testimonials; track t.name) {
          <div class="tm__card">
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
