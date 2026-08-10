import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RouterLink } from "@angular/router";
import { RevealDirective } from "../../../shared/directives/reveal.directive";

interface Value {
  icon: 'leaf' | 'flask' | 'heart' | 'globe';
  title: string;
  desc: string;
}

interface RangeItem {
  title: string;
  desc: string;
  image: string;
  link: string[];
}

@Component({
  selector: "lk-about",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"]
})
export class AboutComponent {
  readonly values: Value[] = [
    {
      icon: 'leaf',
      title: '100% natural',
      desc: 'Every ingredient is botanical, sourced from trusted farms across India with full supply chain traceability.'
    },
    {
      icon: 'flask',
      title: 'Lab verified',
      desc: 'Each batch is tested for purity and potency before it reaches you. No compromises on quality standards.'
    },
    {
      icon: 'heart',
      title: 'Customer first',
      desc: 'If you are not satisfied, we make it right — no questions asked. Your trust is our most prized possession.'
    },
    {
      icon: 'globe',
      title: 'Sustainably sourced',
      desc: 'We partner with small farms and use eco-friendly packaging, because what is good for you should be good for the planet too.'
    }
  ];

  readonly range: RangeItem[] = [
    {
      title: 'Hair Oils',
      desc: 'Cold-pressed and slow-infused — amla, bhringraj, neem and hibiscus blended with precision.',
      image: '/assets/images/ayurvedic_hair_oil.png',
      link: ['/shop'],
    },
    {
      title: 'Shampoos',
      desc: 'Herbal formulations free from sulphates, parabens and synthetic fragrance.',
      image: '/assets/images/ayurvedic_shampoo.png',
      link: ['/shop'],
    },
    {
      title: 'Face & Skin',
      desc: 'Kumkumadi, aloe and sandalwood classics for a routine that goes beyond hair.',
      image: '/assets/images/face-serum.webp',
      link: ['/shop'],
    },
    {
      title: 'Hair Wigs & Patches',
      desc: 'Custom-crafted with natural hairlines — undetectable, fitted to order.',
      image: '/assets/images/premium_hair_wig.png',
      link: ['/hair-wigs'],
    }
  ];
}
