import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lk-hair-solutions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="sol-page">
      <!-- Hero -->
      <section class="sol-hero">
        <div class="lk-shell">
          <div class="sol-hero__rail" aria-hidden="true">
            <span class="sol-hero__mark">Core offerings</span>
            <span class="sol-hero__rule"></span>
            <span class="sol-hero__mark sol-hero__mark--mid">Human Remy hair</span>
            <span class="sol-hero__rule"></span>
            <span class="sol-hero__mark">Luv Kush Natural</span>
          </div>
          <h1 class="sol-hero__title">Hair systems, <em>fitted to you</em></h1>
          <p class="sol-hero__sub">Custom-crafted wigs and patches built from 100% natural human hair — designed to restore your confidence, not just your hairline.</p>
        </div>
      </section>

      <!-- Selector grid -->
      <section class="sol-grid-section">
        <div class="lk-shell sol-grid">

          <a routerLink="/hair-wigs" class="sol-card">
            <span class="sol-card__media">
              <img src="/assets/images/premium_hair_wig.png" alt="Premium hair wigs" loading="lazy" width="360" height="360" />
            </span>
            <span class="sol-card__contact" aria-hidden="true"></span>
            <span class="sol-card__badge">Full coverage</span>
            <h2 class="sol-card__title">Premium wigs</h2>
            <p class="sol-card__desc">Undetectable natural hairlines, custom-sized and meticulously styled — for men, women, and unisex requirements.</p>
            <span class="sol-card__cta">
              Explore wigs collection
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </a>

          <a routerLink="/hair-patches" class="sol-card">
            <span class="sol-card__media">
              <img src="/assets/images/hair_patch.png" alt="Custom hair patches" loading="lazy" width="360" height="360" />
            </span>
            <span class="sol-card__contact" aria-hidden="true"></span>
            <span class="sol-card__badge">Partial coverage</span>
            <h2 class="sol-card__title">Custom patches</h2>
            <p class="sol-card__desc">Seamless scalp blending and instant volume where you need it most, on breathable bases built for everyday durability.</p>
            <span class="sol-card__cta">
              Explore patches collection
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </a>

        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; background: var(--lk-white); }

    .sol-hero {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(110% 90% at 85% 0%, var(--lk-green-50) 0%, transparent 60%),
        linear-gradient(178deg, #FCFBF7 0%, var(--lk-cream) 100%);
      padding-block: clamp(2.4rem, 5vw, 3.6rem) clamp(2.4rem, 5vw, 3.4rem);
      border-bottom: 1px solid var(--lk-line);
    }
    .sol-hero__rail { display: flex; align-items: center; gap: clamp(.6rem, 2vw, 1.2rem); margin-bottom: 1.3rem; }
    .sol-hero__mark {
      flex: none;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: .64rem;
      font-weight: 600;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--lk-muted);
      white-space: nowrap;

      &--mid { color: var(--lk-green-700); }
      @media (max-width: 620px) { &:not(&--mid) { display: none; } }
    }
    .sol-hero__rule { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--lk-line), transparent); }

    .sol-hero__title {
      margin: 0;
      max-width: 20ch;
      font-family: 'DM Serif Display', Georgia, serif;
      font-weight: 400;
      font-size: clamp(2.2rem, 4.8vw, 3.4rem);
      line-height: 1.1;
      letter-spacing: -.015em;
      color: var(--lk-ink);

      em { font-style: italic; color: var(--lk-green-600); }
    }
    .sol-hero__sub { margin: 1.1rem 0 0; max-width: 56ch; font-size: 1rem; line-height: 1.65; color: var(--lk-body); }

    .sol-grid-section { padding-block: clamp(3rem, 6vw, 5rem); }

    .sol-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.6rem;
      max-width: 760px;
      @media (min-width: 640px) { grid-template-columns: 1fr 1fr; gap: 2rem; }
    }

    // A specimen card, not a hero banner — same restrained vocabulary as the
    // product range on the About page: a dome portrait, then text beneath it.
    .sol-card {
      display: block;
      text-decoration: none;
      text-align: center;
    }

    .sol-card__media {
      position: relative;
      display: block;
      aspect-ratio: 1 / 1;
      max-width: 260px;
      margin: 0 auto;
      border-radius: 44% 44% var(--lk-r-md) var(--lk-r-md) / 16% 16% 2% 2%;
      overflow: hidden;
      background: var(--lk-green-50);
      box-shadow: var(--lk-shadow-xs), 0 8px 22px rgba(22, 33, 26, .09);
      transition: transform var(--lk-t-base), box-shadow var(--lk-t-base);

      img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--lk-t-slow); }
    }

    .sol-card__contact {
      display: block;
      height: 18px;
      max-width: 260px;
      margin: -9px auto 0;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(22, 33, 26, .24), transparent 70%);
      filter: blur(9px);
      opacity: .55;
    }

    .sol-card:hover {
      .sol-card__media { transform: translateY(-5px); box-shadow: var(--lk-shadow-md); img { transform: scale(1.06); } }
      .sol-card__title { color: var(--lk-green-700); }
      .sol-card__cta { color: var(--lk-orange-600); svg { transform: translateX(3px); } }
    }

    .sol-card__badge {
      display: inline-block;
      margin: 1.2rem 0 0;
      padding: .28rem .75rem;
      border-radius: var(--lk-r-pill);
      background: var(--lk-orange-50);
      border: 1px solid var(--lk-orange-100);
      color: var(--lk-orange-700);
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: .66rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .sol-card__title {
      margin: .6rem 0 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-weight: 400;
      font-size: 1.35rem;
      letter-spacing: -.01em;
      color: var(--lk-ink);
      transition: color var(--lk-t-fast);
    }

    .sol-card__desc {
      margin: .55rem auto 0;
      max-width: 34ch;
      font-size: .87rem;
      line-height: 1.6;
      color: var(--lk-muted);
    }

    .sol-card__cta {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      margin-top: 1rem;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: .84rem;
      font-weight: 600;
      letter-spacing: .02em;
      color: var(--lk-green-700);
      transition: color var(--lk-t-fast);

      svg { transition: transform var(--lk-t-fast); }
    }

    @media (prefers-reduced-motion: reduce) {
      .sol-card__media, .sol-card__media img, .sol-card__title, .sol-card__cta, .sol-card__cta svg { transition: none; }
    }
  `]
})
export class HairSolutionsComponent {}
