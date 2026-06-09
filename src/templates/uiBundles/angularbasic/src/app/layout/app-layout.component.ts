import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <a routerLink="/" class="text-xl font-semibold text-gray-900">
            Angular App
          </a>
          <button
            (click)="toggleMenu()"
            class="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <div class="w-6 h-6 flex flex-col justify-center space-y-1.5">
              <span
                class="block h-0.5 w-6 bg-current transition-all"
                [class.rotate-45]="isOpen()"
                [class.translate-y-2]="isOpen()"
              ></span>
              <span
                class="block h-0.5 w-6 bg-current transition-all"
                [class.opacity-0]="isOpen()"
              ></span>
              <span
                class="block h-0.5 w-6 bg-current transition-all"
                [class.-rotate-45]="isOpen()"
                [class.-translate-y-2]="isOpen()"
              ></span>
            </div>
          </button>
        </div>
        @if (isOpen()) {
          <div class="pb-4">
            <div class="flex flex-col space-y-2">
              @for (item of navigationItems; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-blue-100 text-blue-700"
                  [routerLinkActiveOptions]="{ exact: true }"
                  (click)="closeMenu()"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
                >
                  {{ item.label }}
                </a>
              }
            </div>
          </div>
        }
      </div>
    </nav>
    <router-outlet />
  `,
})
export class AppLayoutComponent {
  isOpen = signal(false);

  navigationItems = [{ path: '/', label: 'Home' }];

  toggleMenu(): void {
    this.isOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }
}
