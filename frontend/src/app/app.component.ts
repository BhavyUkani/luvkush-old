import {
  Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy,
  inject, PLATFORM_ID, signal, computed
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router, RouterOutlet, NavigationEnd } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationComponent } from "./shared/components/navigation/navigation.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { ToastComponent } from "./shared/components/toast/toast.component";
import { SeoService } from "./core/services/seo.service";

@Component({
  selector: "lk-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavigationComponent, FooterComponent, ToastComponent],
  template: `
    @if (!isAdmin()) { <lk-navigation /> }
    <main [class]="isAdmin() ? 'lk-admin-shell' : 'lk-main'">
      <router-outlet />
    </main>
    @if (!isAdmin()) { <lk-footer /> }
    <lk-toast />
  `,
  styles: [`
    .lk-main { padding-top: 96px; min-height: 100vh; }
    .lk-admin-shell { min-height: 100vh; }
  `]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly seoService = inject(SeoService);
  private readonly router     = inject(Router);
  private lenis: any;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: "" }
  );

  readonly isAdmin = computed(() => this.currentUrl().startsWith("/admin"));

  ngOnInit(): void {
    this.seoService.initDefaultMeta();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Initialize Lenis smooth scroll dynamically on the browser
    import('lenis').then(({ default: Lenis }) => {
      this.lenis = new Lenis({
        autoRaf: true
      });
    });

    // IntersectionObserver scroll reveal — watches elements with class 'reveal'
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Observe after short delay to let Angular render
    setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale, .reveal-stagger').forEach(el => observer.observe(el));
      // Also re-observe on route changes (handled below)
      (this as any)._revealObserver = observer;
    }, 200);

    // MutationObserver to auto-observe newly added .reveal elements (e.g. from async API rendering)
    if (typeof MutationObserver !== 'undefined') {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.classList && (
                el.classList.contains('reveal') || 
                el.classList.contains('reveal-fade') || 
                el.classList.contains('reveal-scale') || 
                el.classList.contains('reveal-stagger')
              )) {
                observer.observe(el);
              }
              el.querySelectorAll('.reveal, .reveal-fade, .reveal-scale, .reveal-stagger').forEach(child => {
                observer.observe(child);
              });
            }
          });
        });
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Safety fallback: ensure preloader is dismissed after 1.5s max
    setTimeout(() => this.dismissPreloader(), 1500);

    // If initial navigation is already complete, dismiss immediately
    if (this.router.navigated) {
      this.dismissPreloader();
      return;
    }

    // Otherwise, dismiss on the next NavigationEnd event, and re-trigger reveal
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => void 0)
    ).subscribe(() => {
      this.dismissPreloader();
      setTimeout(() => {
        const obs = (this as any)._revealObserver as IntersectionObserver | undefined;
        if (obs) {
          document.querySelectorAll('.reveal:not(.is-visible), .reveal-fade:not(.is-visible), .reveal-scale:not(.is-visible), .reveal-stagger:not(.is-visible)').forEach(el => obs.observe(el));
        }
      }, 100);
    });
  }

  ngOnDestroy(): void {
    if (this.lenis) {
      this.lenis.destroy();
    }
  }

  private preloaderDismissed = false;
  private dismissPreloader(): void {
    if (this.preloaderDismissed) return;
    this.preloaderDismissed = true;
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    preloader.style.transition = "opacity 0.5s ease";
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
      document.body.classList.add("loaded");
    }, 500);
  }
}