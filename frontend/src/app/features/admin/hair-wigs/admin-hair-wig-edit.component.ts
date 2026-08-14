import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HairSolutionEditBase } from '../shared/hair-solution-edit.base';

const EMPTY = () => ({
  name: '', short_description: '', description: '',
  base_price: '', mrp: '', gender: '', size_info: '', colour_info: '',
  how_to_use: '', status: 'active', payment_mode: 'full_cod', advance_amount: ''
});

@Component({
  selector: 'lk-admin-hair-wig-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-hair-wig-edit.component.html',
  styleUrls: ['./admin-hair-wig-edit.component.scss'],
})
export class AdminHairWigEditComponent extends HairSolutionEditBase {
  protected readonly solutionType = 'wig' as const;
  protected readonly listRoute = '/admin/wigs';
  protected readonly publicPath = '/hair-wigs';
  protected readonly typeLabel = 'Hair wig';
  protected emptyForm() { return EMPTY(); }
}
