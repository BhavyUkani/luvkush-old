import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminConfirmService } from './admin-confirm.service';

@Component({
  selector: 'lk-admin-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './admin-confirm-dialog.component.html',
  styleUrls: ['./admin-confirm-dialog.component.scss'],
})
export class AdminConfirmDialogComponent {
  readonly svc = inject(AdminConfirmService);
}
