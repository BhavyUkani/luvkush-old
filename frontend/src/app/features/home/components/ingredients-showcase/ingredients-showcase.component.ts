import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface Ingredient {
  key: string;
  name: string;
  botanical: string;
  role: string;
  copy: string;
  image: string;
  stat: { value: string; label: string };
}

const INGREDIENTS: Ingredient[] = [
  {
    key: 'bhringraj',
    name: 'Bhringraj',
    botanical: 'Eclipta alba',
    role: 'Growth & density',
    copy: 'Called the “king of hair” in classical Ayurveda. We slow-infuse fresh leaves in sesame oil for 48 hours, which draws out far more of the active wedelolactone than a quick cold press ever would.',
    image: '/assets/images/ingredient-brahmi.jpg',
    stat: { value: '48 hrs', label: 'Slow infusion' },
  },
  {
    key: 'amla',
    name: 'Amla',
    botanical: 'Phyllanthus emblica',
    role: 'Strength & shine',
    copy: 'Indian gooseberry carries up to twenty times the vitamin C of an orange. It rebuilds keratin bonds and holds colour, which is why it sits at the base of nearly every formula we make.',
    image: '/assets/images/ingredient-amla.jpg',
    stat: { value: '20×', label: 'Vitamin C vs orange' },
  },
  {
    key: 'neem',
    name: 'Neem',
    botanical: 'Azadirachta indica',
    role: 'Scalp health',
    copy: 'Naturally antifungal and antibacterial. Neem settles the flaking and itch that quietly undermines growth, without the harshness of a medicated shampoo.',
    image: '/assets/images/ingredient-neem.jpg',
    stat: { value: '0%', label: 'Sulphates & parabens' },
  },
  {
    key: 'hibiscus',
    name: 'Hibiscus',
    botanical: 'Hibiscus rosa-sinensis',
    role: 'Conditioning',
    copy: 'Rich in mucilage and amino acids, hibiscus coats the shaft and smooths the cuticle. It is the reason our masks leave hair soft without a single silicone.',
    image: '/assets/images/ingredient-hibiscus.jpg',
    stat: { value: '100%', label: 'Plant-derived actives' },
  },
];

@Component({
  selector: 'lk-ingredients-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RevealDirective],
  template: `
    <section class="ing lk-section" aria-labelledby="ing-title">
      <div class="lk-shell">

        <div class="lk-head lk-head--center">
          <div>
            <span class="lk-eyebrow lk-eyebrow--center lk-eyebrow--on-dark">Sourced, not synthesised</span>
            <h2 class="lk-title lk-title--on-dark" id="ing-title">Four herbs doing <em>most of the work</em></h2>
            <p class="lk-lede lk-lede--on-dark">
              Every formula starts with whole botanicals, traceable to the farm. No fillers,
              no fragrance, nothing added just to make a label look longer than it is.
            </p>
          </div>
        </div>

        <div class="ing__panel" lkReveal>
          <div class="ing__list" role="tablist" aria-label="Key ingredients">
            @for (ing of ingredients; track ing.key; let i = $index) {
              <button
                type="button"
                role="tab"
                class="ing__item"
                [class.is-active]="i === index()"
                [attr.aria-selected]="i === index()"
                (click)="select(i)"
              >
                <span class="ing__item-name">{{ ing.name }}</span>
                <span class="ing__item-role">{{ ing.role }}</span>
                <svg class="ing__item-arrow" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            }
          </div>

          @if (current(); as ing) {
            <div class="ing__detail">
              <figure class="ing__media">
                <img [src]="ing.image" [alt]="ing.name" loading="lazy" width="640" height="640"
                     (error)="$any($event.target).src='/assets/images/placeholder.webp'" />
                <figcaption class="ing__stat">
                  <strong>{{ ing.stat.value }}</strong>
                  <span>{{ ing.stat.label }}</span>
                </figcaption>
              </figure>

              <div class="ing__copy">
                <h3 class="ing__name">{{ ing.name }}</h3>
                <p class="ing__botanical">{{ ing.botanical }}</p>
                <p class="ing__text">{{ ing.copy }}</p>
                <a class="lk-link lk-link--on-dark" routerLink="/about">
                  How we source
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          }
        </div>

      </div>
    </section>
  `,
  styles: [`
    .ing {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(90% 70% at 80% 0%, rgba(47, 107, 73, .5) 0%, transparent 65%),
        linear-gradient(165deg, var(--lk-green-900) 0%, var(--lk-green-950) 100%);
      color: #fff;
    }

    .ing__panel {
      display: grid;
      grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr);
      gap: clamp(1.5rem, 3.5vw, 3rem);
      align-items: start;
    }
    @media (max-width: 900px) { .ing__panel { grid-template-columns: 1fr; } }

    .ing__list { display: flex; flex-direction: column; gap: .35rem; }
    @media (max-width: 900px) {
      .ing__list { flex-direction: row; overflow-x: auto; padding-bottom: .35rem; }
      .ing__item { flex: 0 0 auto; }
      .ing__item-arrow { display: none; }
    }

    .ing__item {
      display: flex;
      align-items: center;
      gap: .75rem;
      width: 100%;
      padding: .95rem 1.05rem;
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: var(--lk-r-md);
      background: rgba(255, 255, 255, .04);
      color: rgba(255, 255, 255, .8);
      text-align: left;
      cursor: pointer;
      transition: background var(--lk-t-fast), border-color var(--lk-t-fast), color var(--lk-t-fast);
    }
    .ing__item:hover {
      background: rgba(255, 255, 255, .08);
      border-color: rgba(255, 255, 255, .22);
      color: #fff;
    }
    .ing__item.is-active {
      background: rgba(255, 255, 255, .1);
      border-color: var(--lk-orange-400);
      color: #fff;
    }
    .ing__item.is-active .ing__item-arrow { color: var(--lk-orange-400); transform: translateX(2px); }
    .ing__item:focus-visible { outline: 2px solid var(--lk-orange-300); outline-offset: 2px; }

    .ing__item-name { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.06rem; }
    .ing__item-role {
      margin-left: auto;
      font-size: .72rem;
      letter-spacing: .05em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, .5);
    }
    .ing__item-arrow {
      flex: none;
      color: rgba(255, 255, 255, .3);
      transition: transform var(--lk-t-fast), color var(--lk-t-fast);
    }

    .ing__detail {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: clamp(1.2rem, 2.5vw, 2.2rem);
      align-items: center;
      padding: clamp(1rem, 2vw, 1.5rem);
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: var(--lk-r-lg);
      background: rgba(255, 255, 255, .04);
    }
    @media (max-width: 640px) { .ing__detail { grid-template-columns: 1fr; } }

    .ing__media {
      position: relative;
      margin: 0;
      aspect-ratio: 1 / 1;
      border-radius: var(--lk-r-md);
      overflow: hidden;
    }
    .ing__media img {
      width: 100%; height: 100%;
      object-fit: cover;
      animation: ingFade var(--lk-t-slow) both;
    }
    @keyframes ingFade {
      from { opacity: 0; transform: scale(1.04); }
      to   { opacity: 1; transform: none; }
    }

    .ing__stat {
      position: absolute;
      left: .7rem;
      bottom: .7rem;
      padding: .5rem .8rem;
      border-radius: var(--lk-r-sm);
      background: rgba(15, 36, 26, .82);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, .14);
    }
    .ing__stat strong {
      display: block;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--lk-orange-300);
      line-height: 1.1;
    }
    .ing__stat span { font-size: .68rem; letter-spacing: .05em; color: rgba(255, 255, 255, .65); }

    .ing__name {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-weight: 400;
      font-size: clamp(1.5rem, 2.6vw, 2rem);
      line-height: 1.15;
    }
    .ing__botanical { margin: .2rem 0 0; font-style: italic; font-size: .87rem; color: var(--lk-orange-300); }
    .ing__text {
      margin: .9rem 0 1.3rem;
      font-size: .95rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, .76);
    }

    @media (prefers-reduced-motion: reduce) {
      .ing__media img { animation: none; }
      .ing__item { transition: none; }
    }
  `]
})
export class IngredientsShowcaseComponent {
  readonly ingredients = INGREDIENTS;
  readonly index = signal(0);
  readonly current = computed(() => this.ingredients[this.index()]);

  select(i: number): void {
    this.index.set(i);
  }
}
