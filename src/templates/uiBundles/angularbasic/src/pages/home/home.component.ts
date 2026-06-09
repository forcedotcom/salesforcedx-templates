import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  steps = [
    { num: 1, label: 'Generate template', cmd: 'sf template generate ui-bundle -n myApp -t angularbasic' },
    { num: 2, label: 'Install dependencies', cmd: 'npm i' },
    { num: 3, label: 'Start dev server', cmd: 'npm run dev' },
    { num: 4, label: 'Build for production', cmd: 'npm run build' },
    { num: 5, label: 'Deploy to Salesforce', cmd: 'sf project deploy start --source-dir force-app/main/default/uiBundles --target-org <your-org-alias>' },
  ];
}
