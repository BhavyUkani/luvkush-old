import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminToastService } from './admin-toast.service';

@Component({
  selector: 'lk-admin-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './admin-toast.component.html',
  styleUrls: ['./admin-toast.component.scss'],
})
export class AdminToastComponent {
  readonly svc = inject(AdminToastService);
}
