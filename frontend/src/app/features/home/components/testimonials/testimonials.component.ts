import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  product: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'I had tried four different oils before this one. The difference here is that it actually absorbs — my scalp does not feel coated the next morning. Hair fall dropped noticeably by the second month.',
    name: 'Ananya Sharma',
    location: 'Pune',
    product: 'Bhringraj Hair Growth Oil',
    rating: 5,
  },
  {
    quote: 'Bought the shampoo expecting the usual herbal harshness. It lathers properly without sulphates, which I did not think was possible. My colour has held far longer than it used to.',
    name: 'Meera Krishnan',
    location: 'Chennai',
    product: 'Herbal Anti Hair Fall Shampoo',
    rating: 5,
  },
  {
    quote: 'The patch is genuinely undetectable. I was worried about the front hairline but nobody at work has said a word in six months. Fitting was handled properly and patiently.',
    name: 'Rohit Desai',
    location: 'Ahmedabad',
    product: 'Micro Thin Skin Hair Patch',
    rating: 5,
  },
  {
    quote: 'Took about six weeks before I saw anything, so do not expect overnight results. But the regrowth around my temples is real and my stylist noticed before I mentioned it.',
    name: 'Priya Nair',
    location: 'Kochi',
    product: 'Kesh Raksha Ayurvedic Oil',
    rating: 4,
  },
];

@Component({
  selector: 'lk-testimonials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RevealDirective],
  template: `
    <section class="tst lk-section" aria-labelledby="tst-title">
      <div class="lk-shell">

        <div class="lk-head lk-head--center">
          <div>
            <span class="lk-eyebrow lk-eyebrow--center">In their words</span>
            <h2 class="lk-title" id="tst-title">Results worth <em>waiting for</em></h2>
            <p class="lk-lede">
              Ayurveda works on its own timeline. These are unedited reviews from
              customers who stayed with it.
            </p>
          </div>
        </div>

        <div class="tst__grid">
          @for (t of testimonials; track t.name; let i = $index) {
            <figure class="tst__card" [lkReveal]="i">
              <div class="tst__stars" [attr.aria-label]="t.rating + ' out of 5 stars'">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"
                       [class.is-on]="s <= t.rating" aria-hidden="true">
                    <path d="M8 1.6l1.9 4h4.2l-3.4 2.9 1.2 4.2L8 10.3l-3.9 2.4 1.2-4.2L1.9 5.6h4.2L8 1.6Z"/>
                  </svg>
                }
              </div>

              <blockquote class="tst__quote">{{ t.quote }}</blockquote>

              <figcaption class="tst__by">
                <span class="tst__avatar" aria-hidden="true">{{ t.name.charAt(0) }}</span>
                <span class="tst__meta">
                  <strong>{{ t.name }}</strong>
                  <span>{{ t.location }}</span>
                </span>
                <span class="tst__verified">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M5.5 8.2l1.8 1.8 3.3-3.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Verified
                </span>
              </figcaption>

              <p class="tst__product">{{ t.product }}</p>
            </figure>
          }
        </div>

      </div>
    </section>
  `,
  styles: [`
    .tst { background: var(--lk-cream); }

    .tst__grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: clamp(.9rem, 1.8vw, 1.4rem);
    }
    @media (max-width: 1100px) { .tst__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 620px)  { .tst__grid { grid-template-columns: 1fr; } }

    .tst__card {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: clamp(1.25rem, 2vw, 1.65rem);
      border-radius: var(--lk-r-lg);
      background: var(--lk-white);
      border: 1px solid var(--lk-line);
      transition: transform var(--lk-t-base), box-shadow var(--lk-t-base);
    }
    .tst__card:hover { transform: translateY(-4px); box-shadow: var(--lk-shadow-md); }

    .tst__stars { display: inline-flex; gap: 1px; color: var(--lk-line); }
    .tst__stars svg.is-on { color: var(--lk-star); }

    .tst__quote {
      margin: .85rem 0 0;
      font-size: .89rem;
      line-height: 1.68;
      color: var(--lk-body);
      flex: 1;
    }

    .tst__by {
      display: flex;
      align-items: center;
      gap: .6rem;
      margin-top: 1.15rem;
      padding-top: 1rem;
      border-top: 1px solid var(--lk-line-soft);
    }

    .tst__avatar {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      flex: none;
      border-radius: 50%;
      background: var(--lk-green-100);
      color: var(--lk-green-700);
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1rem;
    }

    .tst__meta { display: flex; flex-direction: column; line-height: 1.3; }
    .tst__meta strong { font-size: .85rem; color: var(--lk-ink); font-weight: 600; }
    .tst__meta span { font-size: .74rem; color: var(--lk-muted); }

    .tst__verified {
      display: inline-flex;
      align-items: center;
      gap: .22rem;
      margin-left: auto;
      font-size: .68rem;
      font-weight: 600;
      color: var(--lk-green-600);
    }

    .tst__product {
      margin: .75rem 0 0;
      font-size: .72rem;
      letter-spacing: .04em;
      color: var(--lk-muted);
    }

    @media (prefers-reduced-motion: reduce) { .tst__card { transition: none; } }
  `]
})
export class TestimonialsComponent {
  readonly testimonials = TESTIMONIALS;
}
