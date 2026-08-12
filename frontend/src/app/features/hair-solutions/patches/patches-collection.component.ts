import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { imageUrl } from '../../../shared/utils/image-url';

interface Patch {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  mrp: number | null;
  primary_image: string | null;
  size_info: string | null;
  colour_info: string | null;
}

@Component({
  selector: 'lk-patches-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './patches-collection.component.html',
  styleUrls: ['./patches-collection.component.scss']
})
export class PatchesCollectionComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly imgUrl = imageUrl;

  items = signal<Patch[]>([]);
  loading = signal(true);
  error = signal('');

  discount(p: Patch): number {
    if (!p.mrp || p.mrp <= p.price) return 0;
    return Math.round(((p.mrp - p.price) / p.mrp) * 100);
  }

  ngOnInit(): void {
    this.api.get<any>('/hair-solutions/patches').subscribe({
      next: (res: any) => { this.items.set(res.data || []); this.loading.set(false); },
      error: () => { this.error.set('Failed to load hair patches. Please try again.'); this.loading.set(false); }
    });
  }
}
