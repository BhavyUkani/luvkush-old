import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'lk-wisdom-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RevealDirective],
  template: `
    <section class="wis lk-section" aria-labelledby="wis-title">
      <div class="lk-shell wis__grid">

        <div class="wis__media" lkReveal>
          <img src="/assets/images/botanical-flatlay.jpg"
               alt="Ayurvedic botanicals and oils laid out on a workbench"
               loading="lazy" width="800" height="800"
               (error)="$any($event.target).src='/assets/images/placeholder.webp'" />
          <div class="wis__badge">
            <strong>1000+</strong>
            <span>years of documented practice</span>
          </div>
        </div>

        <div class="wis__copy" [lkReveal]="1">
          <span class="lk-eyebrow">Our approach</span>
          <h2 class="lk-title" id="wis-title">Old formulas, held to <em>modern standards</em></h2>

          <p class="wis__text">
            Our recipes come from classical Ayurvedic texts — the Charaka Samhita, the
            Bhaishajya Ratnavali — but we do not treat tradition as a reason to skip testing.
            Every batch is checked for heavy metals and microbial load before it leaves the
            workshop.
          </p>
          <p class="wis__text">
            That combination is the whole point. Ancient methods gave us the formulations.
            Modern quality control is what lets us stand behind them.
          </p>

          <ul class="wis__steps">
            <li>
              <span class="wis__num">01</span>
              <div>
                <strong>Sourced direct</strong>
                <p>Herbs bought from growers in Kerala, Gujarat and Tamil Nadu — no middlemen, no blending houses.</p>
              </div>
            </li>
            <li>
              <span class="wis__num">02</span>
              <div>
                <strong>Infused slowly</strong>
                <p>Up to 48 hours of low-heat extraction, the traditional taila paka method, never a fast solvent process.</p>
              </div>
            </li>
            <li>
              <span class="wis__num">03</span>
              <div>
                <strong>Tested before release</strong>
                <p>Third-party lab reports on every batch, available on request for any order you place.</p>
              </div>
            </li>
          </ul>

          <a class="lk-btn lk-btn--solid wis__cta" routerLink="/about">
            Read our story
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .wis { background: var(--lk-white); }

    .wis__grid {
      display: grid;
      grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
      gap: clamp(1.8rem, 4.5vw, 4rem);
      align-items: center;
    }
    @media (max-width: 940px) { .wis__grid { grid-template-columns: 1fr; } }

    .wis__media {
      position: relative;
      border-radius: var(--lk-r-xl);
      overflow: hidden;
      aspect-ratio: 4 / 4.4;
      background: var(--lk-green-50);
      box-shadow: var(--lk-shadow-lg);
    }
    .wis__media img { width: 100%; height: 100%; object-fit: cover; }

    .wis__badge {
      position: absolute;
      left: 1rem;
      bottom: 1rem;
      padding: .8rem 1.05rem;
      border-radius: var(--lk-r-md);
      background: rgba(255, 255, 255, .93);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, .7);
      box-shadow: var(--lk-shadow-sm);
    }
    .wis__badge strong {
      display: block;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--lk-green-700);
      line-height: 1.1;
    }
    .wis__badge span { font-size: .74rem; color: var(--lk-muted); }

    .wis__text {
      margin: 1rem 0 0;
      max-width: 56ch;
      font-size: .96rem;
      line-height: 1.72;
      color: var(--lk-body);
    }

    .wis__steps {
      margin: 1.9rem 0 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1.05rem;
    }
    .wis__steps li { display: flex; gap: .95rem; }
    .wis__steps strong {
      display: block;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: .93rem;
      font-weight: 600;
      color: var(--lk-ink);
    }
    .wis__steps p {
      margin: .2rem 0 0;
      font-size: .85rem;
      line-height: 1.6;
      color: var(--lk-muted);
    }

    .wis__num {
      flex: none;
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--lk-orange-50);
      border: 1px solid var(--lk-orange-100);
      color: var(--lk-orange-600);
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: .78rem;
      font-weight: 700;
    }

    .wis__cta { margin-top: 2rem; }
  `]
})
export class WisdomSectionComponent {}
