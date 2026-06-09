import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_BASE_HREF,
      useFactory: () => {
        const basePath = (globalThis as any).SFDC_ENV?.basePath;
        return typeof basePath === 'string'
          ? basePath.replace(/\/+$/, '')
          : '/';
      },
    },
  ],
};
