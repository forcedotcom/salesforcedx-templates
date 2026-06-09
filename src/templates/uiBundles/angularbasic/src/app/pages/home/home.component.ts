import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Home</h1>
        <p class="text-lg text-gray-600 mb-8">
          Welcome to your Angular application.
        </p>
      </div>
    </div>
  `,
})
export class HomeComponent {}
