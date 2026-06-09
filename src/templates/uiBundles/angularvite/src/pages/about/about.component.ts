import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
})
export class AboutComponent {
  features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Built with Vite 7 and Angular 19 for blazing fast dev and production builds.',
    },
    {
      icon: '🎨',
      title: 'Tailwind CSS v4',
      description: 'Utility-first styling with zero config — write less, ship more.',
    },
    {
      icon: '🔗',
      title: 'Salesforce Native',
      description: 'Deep integration with Salesforce APIs, data SDK, and the UI Bundle platform.',
    },
    {
      icon: '🛡️',
      title: 'Type Safe',
      description: "Full TypeScript support with strict mode and Angular's powerful DI system.",
    },
  ];

  stack = [
    { name: 'Angular', role: 'Framework', avatar: 'A' },
    { name: 'Vite', role: 'Build Tool', avatar: 'V' },
    { name: 'Analog', role: 'Vite Bridge', avatar: 'N' },
    { name: 'Salesforce', role: 'Platform', avatar: 'S' },
  ];
}
