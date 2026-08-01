import {
  Directive, ElementRef, Input, OnDestroy, OnInit, PLATFORM_ID, inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Fades + lifts an element into view the first time it is scrolled to.
 *
 * Deliberately fails open: the hiding class is applied only once we are in a
 * browser that can actually observe the element, so server-rendered HTML —
 * and any environment without IntersectionObserver — shows content normally
 * instead of leaving it stuck at opacity 0.
 *
 * A watchdog also reveals the element if no intersection callback has arrived
 * shortly after init, so content can never be permanently hidden by a missed
 * observer notification.
 */
@Directive({
  selector: '[lkReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  /** Stagger index — multiplied into a transition-delay. */
  @Input('lkReveal') delayIndex: number | string = 0;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;
  private watchdog?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const node = this.el.nativeElement as HTMLElement;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // Only now do we take responsibility for showing it again.
    node.classList.add('lk-reveal');

    const d = Number(this.delayIndex) || 0;
    if (d > 0) node.style.transitionDelay = `${Math.min(d, 8) * 70}ms`;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.reveal();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    this.observer.observe(node);

    // Last-resort net only. IntersectionObserver is the real mechanism; this
    // exists purely so a missed notification can never leave content stuck
    // invisible. Long enough not to pre-empt the scroll-triggered reveal.
    this.watchdog = setTimeout(() => this.reveal(), 8000);
  }

  private reveal(): void {
    this.el.nativeElement.classList.add('is-in');
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.watchdog) {
      clearTimeout(this.watchdog);
      this.watchdog = undefined;
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.watchdog) clearTimeout(this.watchdog);
  }
}
