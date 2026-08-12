import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminToastService } from './admin-toast.service';

@Component({
  selector: 'lk-admin-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="at-stack">
      @for (t of svc.toasts(); track t.id) {
        <div class="at-toast" [class]="'at-toast--' + t.kind">
          <div class="at-icon">
            @switch (t.kind) {
              @case ('success') {
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              }
              @case ('error') {
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11" r="0.8" fill="currentColor"/></svg>
              }
              @default {
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 7V11.5M8 5V5.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              }
            }
          </div>
          <span class="at-msg">{{ t.message }}</span>
          <button class="at-close" (click)="svc.dismiss(t.id)" aria-label="Dismiss">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .at-stack { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 3000; display: flex; flex-direction: column; gap: 0.6rem; max-width: 360px; width: calc(100vw - 2rem); }
    .at-toast { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.8rem 0.95rem; border-radius: 8px; background: #fff; border: 1px solid #E8E8E8; border-left: 3px solid #B87333; box-shadow: 0 6px 24px rgba(0,0,0,0.1); animation: at-slide-in 0.2s ease; }
    @keyframes at-slide-in { from { transform: translateX(16px); opacity: 0; } to { transform: none; opacity: 1; } }
    .at-toast--success { border-left-color: #16A34A; }
    .at-toast--success .at-icon { color: #16A34A; }
    .at-toast--error { border-left-color: #DC2626; }
    .at-toast--error .at-icon { color: #DC2626; }
    .at-toast--info .at-icon { color: #B87333; }
    .at-icon { flex-shrink: 0; margin-top: 1px; }
    .at-msg { flex: 1; font-size: 0.83rem; color: #1C1C1C; line-height: 1.5; }
    .at-close { background: none; border: none; cursor: pointer; color: #AAAAAA; padding: 2px; flex-shrink: 0; transition: color 0.15s; }
    .at-close:hover { color: #555; }
  `]
})
export class AdminToastComponent {
  readonly svc = inject(AdminToastService);
}
