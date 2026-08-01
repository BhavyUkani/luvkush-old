import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface Reason {
  title: string;
  copy: string;
  icon: 'leaf' | 'flask' | 'shield' | 'truck';
}

const REASONS: Reason[] = [
  {
    icon: 'leaf',
    title: 'Whole herbs, not extracts',
    copy: 'We buy raw botanicals and process them ourselves. Nothing arrives pre-standardised, so nothing is stripped of the compounds that make it work.',
  },
  {
    icon: 'flask',
    title: 'Small-batch, slow-made',
    copy: 'Oils are infused for up to 48 hours and bottled in batches of a few hundred. It costs more and takes longer — it is also the only way to keep potency.',
  },
  {
    icon: 'shield',
    title: 'Nothing hidden on the label',
    copy: 'No sulphates, parabens, silicones, mineral oil or added fragrance. Every ingredient is listed in full, in plain language, in the order it appears.',
  },
  {
    icon: 'truck',
    title: 'Straightforward delivery',
    copy: 'Free above ₹499, cash on delivery across India, and seven days to send anything back unopened if it is not right for you.',
  },
];

@Component({
  selector: 'lk-why-choose-us',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RevealDirective],
  template: `
    <section class="why lk-section" aria-labelledby="why-title">
      <div class="lk-shell">

        <div class="lk-head lk-head--center">
          <div>
            <span class="lk-eyebrow lk-eyebrow--center">Why Luv Kush</span>
            <h2 class="lk-title" id="why-title">Made the <em>slow way</em>, on purpose</h2>
            <p class="lk-lede">
              There are faster ways to make hair care. None of them produce something
              we would put our name on.
            </p>
          </div>
        </div>

        <div class="why__grid">
          @for (r of reasons; track r.title; let i = $index) {
            <article class="why__card" [lkReveal]="i">
              <span class="why__icon" aria-hidden="true">
                @switch (r.icon) {
                  @case ('leaf') {
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3c6 5 9 9.6 9 14a9 9 0 0 1-18 0c0-4.4 3-9 9-14Z" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M12 5v15M12 11c-2.4 1.2-4.4 2.4-5.8 3.8M12 11c2.4 1.2 4.4 2.4 5.8 3.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                    </svg>
                  }
                  @case ('flask') {
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M9 3h6M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      <path d="M7.3 15h9.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                    </svg>
                  }
                  @case ('shield') {
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l7.5 3v5.6c0 4.6-3.1 8.4-7.5 9.4-4.4-1-7.5-4.8-7.5-9.4V6L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      <path d="M8.8 12.2l2.3 2.3 4.2-4.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  }
                  @case ('truck') {
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="6" width="13" height="10.5" rx="1.6" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M15 9.5h3.6L22 13v3.5h-7" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      <circle cx="6.6" cy="18.4" r="1.9" stroke="currentColor" stroke-width="1.5"/>
                      <circle cx="17.6" cy="18.4" r="1.9" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  }
                }
              </span>
              <h3 class="why__card-title">{{ r.title }}</h3>
              <p class="why__card-copy">{{ r.copy }}</p>
            </article>
          }
        </div>

      </div>
    </section>
  `,
  styles: [`
    .why { background: var(--lk-white); }

    .why__grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: clamp(.9rem, 1.8vw, 1.5rem);
    }
    @media (max-width: 1040px) { .why__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px)  { .why__grid { grid-template-columns: 1fr; } }

    .why__card {
      padding: clamp(1.3rem, 2.2vw, 1.8rem);
      border-radius: var(--lk-r-lg);
      background: var(--lk-green-50);
      border: 1px solid var(--lk-green-100);
      transition: transform var(--lk-t-base), box-shadow var(--lk-t-base), background var(--lk-t-base);
    }
    .why__card:hover {
      transform: translateY(-4px);
      background: var(--lk-white);
      box-shadow: var(--lk-shadow-md);
    }

    .why__icon {
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: var(--lk-r-md);
      background: var(--lk-white);
      border: 1px solid var(--lk-green-100);
      color: var(--lk-green-600);
    }
    .why__card:hover .why__icon { color: var(--lk-orange-500); }

    .why__card-title {
      margin: 1.05rem 0 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-weight: 400;
      font-size: 1.13rem;
      line-height: 1.28;
      color: var(--lk-ink);
    }

    .why__card-copy {
      margin: .5rem 0 0;
      font-size: .87rem;
      line-height: 1.62;
      color: var(--lk-body);
    }

    @media (prefers-reduced-motion: reduce) {
      .why__card { transition: none; }
    }
  `]
})
export class WhyChooseUsComponent {
  readonly reasons = REASONS;
}
