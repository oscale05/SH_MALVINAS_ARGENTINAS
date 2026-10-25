import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CacheService } from './cache.service';
import { of, from } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(CacheService);
  const isCacheable = req.method === 'GET' && (req.url.includes('/dashboard/') || req.url.includes('/health/'));

  if (!isCacheable) return next(req);

  return from(cache.get(req.url)).pipe(
    switchMap((cached) => {
      return next(req).pipe(
        tap((event: any) => {
          if (event?.body && event?.status === 200) {
            cache.set(req.url, event.body);
          }
        }),
        catchError(() => {
          if (cached) {
            return of({ type: 4, body: cached, status: 200, statusText: 'OK (cached)' } as any);
          }
          throw new Error('Network error');
        })
      );
    })
  );
};
