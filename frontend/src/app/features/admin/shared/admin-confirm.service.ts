import { Injectable, signal } from '@angular/core';

export interface AdminConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface AdminConfirmState extends AdminConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class AdminConfirmService {
  readonly state = signal<AdminConfirmState | null>(null);

  confirm(options: AdminConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.state.set({ confirmLabel: 'Confirm', cancelLabel: 'Cancel', danger: false, ...options, resolve });
    });
  }

  resolve(value: boolean): void {
    this.state()?.resolve(value);
    this.state.set(null);
  }
}
