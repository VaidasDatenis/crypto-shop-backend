import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeSoftDeletedInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Retrieve the 'excludeSoftDeleted' metadata
    const excludeSoftDeleted = this.reflector.get<boolean>('excludeSoftDeleted', context.getHandler());

    // If exclusion is not enabled, just pass through the data without filtering
    if (!excludeSoftDeleted) {
      return next.handle();
    }

    // Apply filtering logic
    return next.handle().pipe(
      map(data =>
        Array.isArray(data)
          ? data.filter(item => !item.deletedAt)
          : data.deletedAt ? null : data
      )
    );
  }
}
