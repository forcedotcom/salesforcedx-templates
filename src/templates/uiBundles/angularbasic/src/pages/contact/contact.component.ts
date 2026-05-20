import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  form = { name: '', email: '', subject: '', message: '' };
  submitted = signal(false);

  contactInfo = [
    { icon: '📧', label: 'Email', value: 'team@salesforce.com' },
    { icon: '📍', label: 'Location', value: 'San Francisco, CA' },
    { icon: '🕐', label: 'Response Time', value: 'Within 24 hours' },
  ];

  onSubmit() {
    this.submitted.set(true);
  }

  reset() {
    this.form = { name: '', email: '', subject: '', message: '' };
    this.submitted.set(false);
  }
}
