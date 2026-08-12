import { Component, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../../core/services/api.service";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  query_type: string;
}

@Component({
  selector: "lk-contact",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"]
})
export class ContactComponent {
  private readonly api = inject(ApiService);

  readonly QUERY_TYPES = [
    { value: 'general', label: 'General question' },
    { value: 'order', label: 'Order or shipping' },
    { value: 'product', label: 'Product query' },
    { value: 'return', label: 'Return or refund' },
    { value: 'wholesale', label: 'Bulk / wholesale' },
  ];

  form = signal<ContactForm>({ name: '', email: '', phone: '', subject: '', message: '', query_type: 'general' });
  submitting = signal(false);
  submitted = signal(false);
  error = signal('');

  update<K extends keyof ContactForm>(key: K, value: ContactForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  submit(): void {
    const f = this.form();
    this.error.set('');

    if (!f.name.trim() || !f.email.trim() || !f.message.trim()) {
      this.error.set('Name, email and message are required.');
      return;
    }

    this.submitting.set(true);
    this.api.post('/contact', {
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim() || undefined,
      subject: f.subject.trim() || undefined,
      message: f.message.trim(),
      query_type: f.query_type,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.form.set({ name: '', email: '', phone: '', subject: '', message: '', query_type: 'general' });
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Something went wrong — please try again or reach us on WhatsApp.');
      }
    });
  }
}
