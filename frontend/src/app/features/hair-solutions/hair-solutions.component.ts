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
      <!-- Premium Hero Banner -->
      <div class="sol-hero">
        <div class="sol-hero__inner">
          <p class="sol-hero__eyebrow">Luv Kush Natural · Core Offerings</p>
          <h1 class="sol-hero__title">Hair Solutions</h1>
          <p class="sol-hero__sub">Discover custom-crafted wigs and patches designed to restore your confidence with 100% natural human hair.</p>
        </div>
        <div class="sol-hero__leaf" aria-hidden="true">🌿</div>
      </div>

      <!-- Categories Selection Grid -->
      <div class="sol-grid-section">
        <div class="sol-grid">
          
          <!-- Wigs Card -->
          <a routerLink="/hair-wigs" class="sol-card sol-card--wigs">
            <div class="sol-card__bg-image"></div>
            <div class="sol-card__overlay"></div>
            <div class="sol-card__content">
              <span class="sol-card__badge">Full Coverage</span>
              <h2 class="sol-card__title">Premium Wigs</h2>
              <p class="sol-card__desc">Undetectable natural hairlines, custom-sized and meticulously styled. Available for men, women, and unisex requirements.</p>
              <span class="sol-card__cta">
                Explore Wigs Collection
                <svg class="sol-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </a>

          <!-- Patches Card -->
          <a routerLink="/hair-patches" class="sol-card sol-card--patches">
            <div class="sol-card__bg-image"></div>
            <div class="sol-card__overlay"></div>
            <div class="sol-card__content">
              <span class="sol-card__badge">Partial Coverage</span>
              <h2 class="sol-card__title">Custom Patches</h2>
              <p class="sol-card__desc">Seamless scalp blending and instant volume where you need it most. Breathable bases crafted for everyday durability.</p>
              <span class="sol-card__cta">
                Explore Patches Collection
                <svg class="sol-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </a>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .sol-page {
      min-height: 80vh;
      background: #FAF7F2;
    }

    /* ─── Hero ─── */
    .sol-hero {
      position: relative;
      background: linear-gradient(135deg, #0f2417 0%, #20362A 100%);
      color: #FAF7F2;
      padding: clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 2.5rem);
      text-align: center;
      overflow: hidden;
    }

    .sol-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 80% 20%, rgba(184, 132, 71, 0.15) 0%, transparent 60%);
      pointer-events: none;
    }

    .sol-hero__inner {
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
    }

    .sol-hero__eyebrow {
      font-family: 'Outfit', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #E2C97E;
      margin-bottom: 12px;
    }

    .sol-hero__title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 400;
      margin: 0 0 16px;
      line-height: 1.15;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 10px rgba(0,0,0,0.15);
    }

    .sol-hero__sub {
      font-family: 'DM Sans', sans-serif;
      font-size: clamp(0.95rem, 2vw, 1.15rem);
      color: rgba(250, 247, 242, 0.75);
      line-height: 1.6;
      margin: 0;
    }

    .sol-hero__leaf {
      position: absolute;
      bottom: -20px;
      right: 4%;
      font-size: 8rem;
      opacity: 0.05;
      pointer-events: none;
      user-select: none;
    }

    /* ─── Grid ─── */
    .sol-grid-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 2.5rem);
    }

    .sol-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    @media (min-width: 768px) {
      .sol-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    /* ─── Card ─── */
    .sol-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      aspect-ratio: 1.6;
      display: flex;
      align-items: flex-end;
      padding: clamp(1.5rem, 4vw, 2.5rem);
      text-decoration: none;
      color: #FAF7F2;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  border-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      background: #20362A;
      border: 1px solid rgba(226, 201, 126, 0.15);
    }

    .sol-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      border-color: rgba(226, 201, 126, 0.35);
    }

    .sol-card:hover .sol-card__bg-image {
      transform: scale(1.06);
    }

    .sol-card:hover .sol-card__cta {
      color: #E2C97E;
    }

    .sol-card:hover .sol-card__arrow {
      transform: translateX(4px);
    }

    .sol-card--wigs .sol-card__bg-image {
      background-image: linear-gradient(135deg, rgba(32, 54, 42, 0.85) 0%, rgba(15, 36, 23, 0.95) 100%);
    }

    .sol-card--patches .sol-card__bg-image {
      background-image: linear-gradient(135deg, rgba(107, 58, 42, 0.85) 0%, rgba(45, 26, 18, 0.95) 100%);
    }

    .sol-card__bg-image {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 1;
    }

    .sol-card__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
      z-index: 2;
    }

    .sol-card__content {
      position: relative;
      z-index: 3;
      width: 100%;
    }

    .sol-card__badge {
      display: inline-block;
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 4px 10px;
      background: rgba(226, 201, 126, 0.15);
      border: 1px solid rgba(226, 201, 126, 0.3);
      color: #E2C97E;
      border-radius: 40px;
      margin-bottom: 12px;
    }

    .sol-card__title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-weight: 400;
      margin: 0 0 10px;
      letter-spacing: -0.01em;
      color: #FAF7F2;
    }

    .sol-card__desc {
      font-family: 'DM Sans', sans-serif;
      font-size: clamp(0.85rem, 1.5vw, 0.95rem);
      color: rgba(250, 247, 242, 0.7);
      line-height: 1.5;
      margin: 0 0 20px;
    }

    .sol-card__cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #FAF7F2;
      transition: color 0.3s ease;
    }

    .sol-card__arrow {
      transition: transform 0.3s ease;
    }
  `]
})
export class HairSolutionsComponent {}
