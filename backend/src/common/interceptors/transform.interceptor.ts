import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
  timestamp?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T | ApiResponse<T>>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T | ApiResponse<T>): ApiResponse<T> => {
        // If data is already in our response format, return as-is
        if (this.isApiResponse(data)) {
          return data;
        }
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isApiResponse(value: T | ApiResponse<T>): value is ApiResponse<T> {
    return Boolean(value && typeof value === 'object' && 'success' in value);
  }
}
