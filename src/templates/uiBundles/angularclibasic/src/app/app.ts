import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { executeGraphQL } from '../api/graphql-client';

const CONTACTS_QUERY = `
  query GetContacts {
    uiapi {
      query {
        Contact(first: 5) {
          edges {
            node {
              Id
              Name { value }
            }
          }
        }
      }
    }
  }
`;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('myAngularApp');
  protected readonly apiVersion = signal<string>(__SF_API_VERSION__);
  protected readonly graphqlStatus = signal<string>('idle');

  ngOnInit(): void {
    // Phase 1 verification — observable proof that __SF_API_VERSION__ was substituted.
    console.log('[angularclibasic] __SF_API_VERSION__ =', __SF_API_VERSION__);
    console.log(
      '[angularclibasic] Expected API path:',
      `/services/data/v${__SF_API_VERSION__}/graphql`,
    );

    // Fetch contacts via GraphQL — proxy middleware forwards
    // /services/data/v<version>/graphql to the connected org with auth.
    this.graphqlStatus.set('calling…');
    executeGraphQL(CONTACTS_QUERY)
      .then(() => this.graphqlStatus.set('ok'))
      .catch((err: Error) => {
        console.warn('[angularclibasic] graphql call failed:', err.message);
        this.graphqlStatus.set(`failed: ${err.message}`);
      });
  }
}
