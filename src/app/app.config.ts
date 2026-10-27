import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AdaptadorFechaArgentino } from './core/config/adaptador-fecha';
import { PaginadorIntl } from './core/config/paginador-intl';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// Fechas, números y nombres de días/meses en formato argentino (dd/mm/aaaa).
registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideNativeDateAdapter(),
    // Reemplaza al adaptador nativo para leer las fechas escritas como dd/mm/aaaa.
    { provide: DateAdapter, useClass: AdaptadorFechaArgentino },
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
    { provide: MatPaginatorIntl, useClass: PaginadorIntl },
  ],
};
