import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HairSolutionEditBase } from '../shared/hair-solution-edit.base';

const EMPTY = () => ({
  name: '', short_description: '', description: '',
  base_price: '', mrp: '', size_info: '', colour_info: '',
  how_to_use: '', status: 'active', payment_mode: 'full_cod', advance_amount: ''
});

@Component({
  selector: 'lk-admin-hair-patch-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-hair-patch-edit.component.html',
  styleUrls: ['./admin-hair-patch-edit.component.scss'],
})
export class AdminHairPatchEditComponent extends HairSolutionEditBase {
  protected readonly solutionType = 'patch' as const;
  protected readonly listRoute = '/admin/hair-patches';
  protected readonly publicPath = '/hair-patches';
  protected readonly typeLabel = 'Hair patch';
  protected emptyForm() { return EMPTY(); }
}
