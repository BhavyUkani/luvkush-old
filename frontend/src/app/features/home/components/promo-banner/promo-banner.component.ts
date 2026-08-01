import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'lk-promo-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  template: `
    <section class="promo" aria-labelledby="promo-title">
      <div class="lk-shell">
        <div class="promo__card" lkReveal>

          <div class="promo__copy">
            <span class="promo__flag">First order</span>
            <h2 class="promo__title" id="promo-title">
              Take <em>10% off</em> your first ritual
            </h2>
            <p class="promo__text">
              Use code <strong>NATURAL10</strong> at checkout. Free delivery on everything
              above ₹499, and cash on delivery across India.
            </p>

            <div class="promo__actions">
              <a class="lk-btn lk-btn--primary" routerLink="/shop">
                Start shopping
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a class="lk-btn lk-btn--on-dark" routerLink="/hair-wigs">Hair solutions</a>
            </div>
          </div>

          <ul class="promo__points">
            <li>
              <strong>Free delivery</strong>
              <span>On orders over ₹499</span>
            </li>
            <li>
              <strong>Cash on delivery</strong>
              <span>Available nationwide</span>
            </li>
            <li>
              <strong>7-day returns</strong>
              <span>Unopened, no questions</span>
            </li>
          </ul>

        </div>
      </div>
    </section>
  `,
  styles: [`
    .promo { padding-block: clamp(1rem, 3vw, 2rem) var(--lk-section-y); background: var(--lk-cream); }

    .promo__card {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(0, .75fr);
      gap: clamp(1.5rem, 4vw, 3.5rem);
      align-items: center;
      padding: clamp(1.9rem, 4.5vw, 3.4rem);
      border-radius: var(--lk-r-xl);
      background:
        radial-gradient(80% 120% at 92% 10%, rgba(224, 122, 62, .22) 0%, transparent 58%),
        linear-gradient(140deg, var(--lk-green-800) 0%, var(--lk-green-950) 100%);
      color: #fff;
    }
    @media (max-width: 860px) { .promo__card { grid-template-columns: 1fr; } }

    /* Faint botanical arc, decorative */
    .promo__card::after {
      content: '';
      position: absolute;
      right: -8%;
      bottom: -60%;
      width: 380px;
      height: 380px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, .1);
      pointer-events: none;
    }

    .promo__flag {
      display: inline-block;
      padding: .34rem .8rem;
      border-radius: var(--lk-r-pill);
      background: rgba(255, 255, 255, .12);
      border: 1px solid rgba(255, 255, 255, .2);
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--lk-orange-300);
    }

    .promo__title {
      margin: .9rem 0 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-weight: 400;
      font-size: clamp(1.75rem, 3.6vw, 2.7rem);
      line-height: 1.12;
      letter-spacing: -.015em;
    }
    .promo__title em { font-style: italic; color: var(--lk-orange-300); }

    .promo__text {
      margin: .8rem 0 0;
      max-width: 46ch;
      font-size: .97rem;
      line-height: 1.65;
      color: rgba(255, 255, 255, .76);
    }
    .promo__text strong {
      color: #fff;
      font-weight: 600;
      padding: .1rem .4rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, .12);
      letter-spacing: .04em;
    }

    .promo__actions { display: flex; flex-wrap: wrap; gap: .7rem; margin-top: 1.6rem; }

    .promo__points {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: .9rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .promo__points li {
      padding: .85rem 1.05rem;
      border-radius: var(--lk-r-md);
      background: rgba(255, 255, 255, .06);
      border: 1px solid rgba(255, 255, 255, .12);
    }
    .promo__points strong {
      display: block;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: .92rem;
      font-weight: 600;
    }
    .promo__points span { font-size: .8rem; color: rgba(255, 255, 255, .62); }
  `]
})
export class PromoBannerComponent {}
