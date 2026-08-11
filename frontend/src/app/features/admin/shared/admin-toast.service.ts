import { Injectable, signal } from '@angular/core';

export type AdminToastKind = 'success' | 'error' | 'info';

export interface AdminToast {
  id: number;
  kind: AdminToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminToastService {
  readonly toasts = signal<AdminToast[]>([]);
  private nextId = 1;

  show(message: string, kind: AdminToastKind = 'info'): void {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), 4200);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
