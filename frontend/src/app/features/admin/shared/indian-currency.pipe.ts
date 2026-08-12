import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inr', standalone: true })
export class IndianCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, withSymbol = true): string {
    const n = Math.round(value ?? 0);
    const formatted = n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    return withSymbol ? `₹${formatted}` : formatted;
  }
}
