import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';

interface Wig {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  mrp: number | null;
  primary_image: string | null;
  gender: string | null;
  size_info: string | null;
  colour_info: string | null;
}

@Component({
  selector: 'lk-wigs-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './wigs-collection.component.html',
  styleUrls: ['./wigs-collection.component.scss']
})
export class WigsCollectionComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly imgUrl = imageUrl;

  allWigs = signal<Wig[]>([]);
  loading = signal(true);
  error = signal('');
  genderFilter = signal('');

  readonly FILTERS = [
    { value: '', label: 'All' },
    { value: 'male', label: "Men's" },
    { value: 'female', label: "Women's" },
    { value: 'unisex', label: 'Unisex' },
  ];

  filtered = computed(() => {
    const g = this.genderFilter();
    const wigs = this.allWigs();
    if (!g) return wigs;
    return wigs.filter(w => w.gender === g);
  });

  discount(w: Wig): number {
    if (!w.mrp || w.mrp <= w.price) return 0;
    return Math.round(((w.mrp - w.price) / w.mrp) * 100);
  }

  ngOnInit(): void {
    this.api.get<any>('/hair-solutions/wigs').subscribe({
      next: (res: any) => { this.allWigs.set(res.data || []); this.loading.set(false); },
      error: () => { this.error.set('Failed to load wigs. Please try again.'); this.loading.set(false); }
    });
  }
}
