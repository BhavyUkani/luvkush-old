import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminConfirmService } from './admin-confirm.service';

@Component({
  selector: 'lk-admin-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (svc.state(); as s) {
      <div class="acd-backdrop" (click)="svc.resolve(false)">
        <div class="acd-modal" [class.acd-modal--danger]="s.danger" (click)="$event.stopPropagation()">
          <div class="acd-icon" [class.acd-icon--danger]="s.danger">
            @if (s.danger) {
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L18 17H2L10 3Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M10 8.5V12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                <circle cx="10" cy="14.5" r="0.9" fill="currentColor"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M10 9V14M10 6.5V6.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            }
          </div>
          <h2 class="acd-title">{{ s.title }}</h2>
          <p class="acd-message">{{ s.message }}</p>
          <div class="acd-actions">
            <button class="acd-btn acd-btn--cancel" (click)="svc.resolve(false)">{{ s.cancelLabel }}</button>
            <button class="acd-btn" [class.acd-btn--danger]="s.danger" [class.acd-btn--primary]="!s.danger" (click)="svc.resolve(true)">{{ s.confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .acd-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: acd-fade 0.15s ease; }
    @keyframes acd-fade { from { opacity: 0; } to { opacity: 1; } }
    .acd-modal { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; width: 100%; max-width: 380px; box-shadow: 0 8px 40px rgba(0,0,0,0.16); padding: 1.75rem; text-align: center; animation: acd-pop 0.16s ease; }
    @keyframes acd-pop { from { opacity: 0; transform: translateY(4px) scale(0.98); } to { opacity: 1; transform: none; } }
    .acd-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; background: rgba(184,115,51,0.1); color: #B87333; }
    .acd-icon--danger { background: rgba(220,38,38,0.09); color: #DC2626; }
    .acd-title { font-size: 1rem; font-weight: 700; color: #1C1C1C; margin: 0 0 0.5rem; }
    .acd-message { font-size: 0.85rem; color: #666; line-height: 1.5; margin: 0 0 1.5rem; }
    .acd-actions { display: flex; gap: 0.75rem; }
    .acd-btn { flex: 1; padding: 0.55rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s, background 0.15s; }
    .acd-btn--cancel { background: #fff; border: 1px solid #E8E8E8; color: #555; }
    .acd-btn--cancel:hover { background: #F7F8FA; }
    .acd-btn--primary { background: #B87333; border: none; color: #fff; }
    .acd-btn--primary:hover { opacity: 0.9; }
    .acd-btn--danger { background: #DC2626; border: none; color: #fff; }
    .acd-btn--danger:hover { opacity: 0.9; }
  `]
})
export class AdminConfirmDialogComponent {
  readonly svc = inject(AdminConfirmService);
}
