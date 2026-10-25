import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, LOCALE_ID } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { cacheInterceptor } from './cache.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideIcons } from '@ng-icons/core';
import { heroChartBar, heroArrowUpTray, heroUser, heroLockClosed, heroArrowRightOnRectangle, heroDocumentText, heroArrowPath, heroUserCircle, heroShieldCheck, heroEye, heroEyeSlash } from '@ng-icons/heroicons/outline';
import { registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';

registerLocaleData(localeEsAR);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([cacheInterceptor])),
    provideIcons({ heroChartBar, heroArrowUpTray, heroUser, heroLockClosed, heroArrowRightOnRectangle, heroDocumentText, heroArrowPath, heroUserCircle, heroShieldCheck, heroEye, heroEyeSlash }),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
