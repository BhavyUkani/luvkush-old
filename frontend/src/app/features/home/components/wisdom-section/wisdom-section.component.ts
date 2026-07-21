import { Component, ChangeDetectionStrategy, OnInit, ElementRef, inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'lk-wisdom-section',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    @keyframes countUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes lineGrow {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }

    @keyframes floatBlob1 {
      0%,100% { transform: translate(0,0) scale(1); }
      50%     { transform: translate(16px,-20px) scale(1.04); }
    }

    @keyframes floatBlob2 {
      0%,100% { transform: translate(0,0) scale(1); }
      50%     { transform: translate(-12px,14px) scale(0.97); }
    }

    .ws {
      background: linear-gradient(135deg, #0f2417 0%, #1a3828 40%, #20362A 70%, #162b1e 100%);
      padding: clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 3rem);
      position: relative;
      overflow: hidden;
    }

    /* Animated blobs */
    .ws__blob {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }

    .ws__blob--1 {
      top: -100px; right: -80px;
      width: 560px; height: 560px;
      background: radial-gradient(circle, rgba(184, 132, 71, 0.1) 0%, transparent 65%);
      animation: floatBlob1 8s ease-in-out infinite;
    }

    .ws__blob--2 {
      bottom: -120px; left: -80px;
      width: 480px; height: 480px;
      background: radial-gradient(circle, rgba(54, 80, 59, 0.4) 0%, transparent 65%);
      animation: floatBlob2 10s ease-in-out infinite;
    }

    .ws__blob--3 {
      top: 50%; right: 35%;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(226, 201, 126, 0.06) 0%, transparent 70%);
      animation: floatBlob1 12s ease-in-out infinite 3s;
    }

    /* Dot grid pattern */
    .ws::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(250,247,242,0.04) 1px, transparent 1px);
      background-size: 30px 30px;
      pointer-events: none;
    }

    .ws__inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 5rem;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 900px) {
      .ws__inner {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
    }

    .ws__text { max-width: 620px; }

    .ws__eyebrow {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #B88447;
      margin: 0 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .ws__eyebrow::before {
      content: '';
      display: block;
      width: 36px;
      height: 1px;
      background: #B88447;
      opacity: 0.55;
    }

    .ws__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2.4rem, 5.5vw, 3.75rem);
      font-weight: 500;
      color: #FAF7F2;
      line-height: 1.12;
      margin: 0 0 1.75rem;
      letter-spacing: -0.015em;
    }

    .ws__title em {
      font-style: italic;
      color: #E2C97E;
    }

    .ws__body {
      font-family: 'Manrope', sans-serif;
      font-size: 1rem;
      color: rgba(250, 247, 242, 0.65);
      line-height: 1.85;
      margin: 0 0 2.5rem;
    }

    .ws__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2.25rem;
      background: linear-gradient(135deg, rgba(184,132,71,0.2), rgba(184,132,71,0.08));
      border: 1.5px solid rgba(184, 132, 71, 0.45);
      border-radius: 4px;
      font-family: 'Cinzel', serif;
      font-size: 0.75rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #E2C97E;
      text-decoration: none;
      backdrop-filter: blur(8px);
      transition: background 0.3s ease, border-color 0.3s ease, transform 0.25s ease;
    }

    .ws__cta:hover {
      background: rgba(184, 132, 71, 0.25);
      border-color: rgba(184, 132, 71, 0.7);
      transform: translateY(-2px);
    }

    .ws__cta:hover .ws__cta-arrow { transform: translateX(4px); }

    .ws__cta-arrow {
      transition: transform 0.25s ease;
    }

    /* Stats column */
    .ws__stats {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .ws__stats {
        flex-direction: row;
        justify-content: center;
        gap: 1.25rem;
        flex-wrap: wrap;
      }
    }

    .ws__stat {
      text-align: center;
      padding: 2rem 2.25rem;
      border: 1px solid rgba(184, 132, 71, 0.18);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      min-width: 170px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s ease, transform 0.35s ease, background 0.3s ease;
    }

    .ws__stat::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(184,132,71,0.5), transparent);
      transform: scaleX(0);
      transition: transform 0.4s ease;
      transform-origin: center;
    }

    .ws__stat:hover {
      border-color: rgba(184, 132, 71, 0.4);
      transform: translateY(-4px);
      background: rgba(255,255,255,0.05);
    }

    .ws__stat:hover::after { transform: scaleX(1); }

    .ws__stat-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 3rem;
      font-weight: 600;
      color: #E2C97E;
      line-height: 1;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }

    .ws__stat-label {
      font-family: 'Manrope', sans-serif;
      font-size: 0.8125rem;
      color: rgba(250, 247, 242, 0.55);
      line-height: 1.45;
      margin: 0;
    }
  `],
  template: `
    <section class="ws" aria-labelledby="ws-heading">
      <!-- Animated blobs -->
      <div class="ws__blob ws__blob--1" aria-hidden="true"></div>
      <div class="ws__blob ws__blob--2" aria-hidden="true"></div>
      <div class="ws__blob ws__blob--3" aria-hidden="true"></div>

      <div class="ws__inner">
        <div class="ws__text reveal">
          <p class="ws__eyebrow">Our Heritage</p>
          <h2 class="ws__title" id="ws-heading">
            <em>5000 Years</em> of Herbal Wisdom,<br>
            Modern Hair Restoration
          </h2>
          <p class="ws__body">
            Ancient Indian sages documented the healing properties of these sacred botanicals
            in the Charaka Samhita. Luv Kush Natural honours this living tradition — cold-pressing
            and steam-extracting each herb at peak potency, then blending them into formulations
            that work in harmony with your body's own healing intelligence.
          </p>
          <a routerLink="/about" class="ws__cta" aria-label="Learn more about our story">
            Discover Our Story
            <svg class="ws__cta-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

        <div class="ws__stats reveal">
          <div class="ws__stat">
            <p class="ws__stat-num">5000+</p>
            <p class="ws__stat-label">Years of<br>Herbal Wisdom</p>
          </div>
          <div class="ws__stat">
            <p class="ws__stat-num">10K+</p>
            <p class="ws__stat-label">Happy<br>Customers</p>
          </div>
          <div class="ws__stat">
            <p class="ws__stat-num">100%</p>
            <p class="ws__stat-label">Natural<br>Ingredients</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class WisdomSectionComponent {}
