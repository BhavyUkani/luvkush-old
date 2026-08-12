import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { HeroComponent } from './components/hero/hero.component';
import { CategoryGridComponent } from './components/category-grid/category-grid.component';
import { BestSellersComponent } from './components/best-sellers/best-sellers.component';
import { HairSolutionsListComponent } from './components/hair-solutions-list/hair-solutions-list.component';
import { PromoBannerComponent } from './components/promo-banner/promo-banner.component';
import { IngredientsShowcaseComponent } from './components/ingredients-showcase/ingredients-showcase.component';
import { WisdomSectionComponent } from './components/wisdom-section/wisdom-section.component';
import { WhyChooseUsComponent } from './components/why-choose-us/why-choose-us.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';

@Component({
  selector: 'lk-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    CategoryGridComponent,
    BestSellersComponent,
    PromoBannerComponent,
    IngredientsShowcaseComponent,
    HairSolutionsListComponent,
    WisdomSectionComponent,
    WhyChooseUsComponent,
    TestimonialsComponent
  ],
  // Section order follows the buying journey: orient → browse → convert →
  // justify (ingredients, story) → reassure (testimonials).
  // Backgrounds alternate white / cream / dark so no two neighbours merge.
  template: `
    <lk-hero />
    <lk-category-grid />
    <lk-best-sellers />
    <lk-ingredients-showcase />

    <lk-hair-solutions-list
      eyebrow="Hair systems"
      title="Premium hair wigs"
      subtitle="Undetectable hairlines in 100% human Remy hair, fitted to your head shape."
      type="wig"
      viewAllLink="/hair-wigs"
    />

    <lk-hair-solutions-list
      eyebrow="Hair systems"
      title="Custom hair patches"
      subtitle="Seamless coverage and instant density, cut and shaped to your parting."
      type="patch"
      viewAllLink="/hair-patches"
      tone="cream"
    />

    <lk-wisdom-section />
    <lk-promo-banner />
    <lk-why-choose-us />
    <lk-testimonials />
  `
})
export class HomeComponent {
  constructor() {
    inject(SeoService).updateSeo({
      title: 'Luv Kush Natural — Ayurvedic Hair Care, Wigs & Hair Patches',
      description:
        'Small-batch Ayurvedic hair oils, sulphate-free shampoos, masks and skincare, plus custom hair wigs and patches. 100% natural actives, free delivery over ₹499, cash on delivery across India.',
      keywords:
        'ayurvedic hair oil, herbal shampoo, bhringraj oil, amla hair oil, hair wig India, hair patch, natural hair care'
    });
  }
}
