import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLoggingService } from '../../modules/logs/error-logging.service';
import { ErrorLevel, ErrorCategory } from '../../modules/logs/error-log.schema';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

// SOLID: Single Responsibility Principle - Global exception handling için tek sorumluluk
@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly errorLoggingService: ErrorLoggingService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let category = ErrorCategory.SYSTEM;
    let level = ErrorLevel.ERROR;
    let details: any = null;

    // Correlation ID oluştur (request tracking için)
    const correlationId = request.headers['x-correlation-id'] as string || 
                         `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Exception tipine göre kategorize et
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = exceptionResponse;
      }

      // HTTP status koduna göre kategori belirle
      category = this.getHttpErrorCategory(status);
      level = status >= 500 ? ErrorLevel.ERROR : ErrorLevel.WARN;

    } else if (exception instanceof MongoError) {
      // MongoDB hataları
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database operation failed';
      category = ErrorCategory.DATABASE;
      level = ErrorLevel.ERROR;
      details = {
        code: exception.code,
        codeName: (exception as any).codeName,
        mongoMessage: exception.message
      };

    } else if (exception instanceof MongooseError.ValidationError) {
      // Mongoose validation hataları
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      category = ErrorCategory.VALIDATION;
      level = ErrorLevel.WARN;
      details = {
        validationErrors: Object.values(exception.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: (err as any).value
        }))
      };

    } else if (exception instanceof MongooseError.CastError) {
      // Mongoose cast hataları (geçersiz ObjectId vs)
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data format';
      category = ErrorCategory.VALIDATION;
      level = ErrorLevel.WARN;
      details = {
        field: exception.path,
        value: exception.value,
        expectedType: exception.kind
      };

    } else if (exception instanceof Error) {
      // Genel JavaScript hataları
      message = exception.message || 'Unknown error occurred';
      
      // Özel hata tiplerini kategorize et
      if (exception.name === 'JsonWebTokenError') {
        status = HttpStatus.UNAUTHORIZED;
        category = ErrorCategory.AUTHENTICATION;
        message = 'Invalid token';
      } else if (exception.name === 'TokenExpiredError') {
        status = HttpStatus.UNAUTHORIZED;
        category = ErrorCategory.AUTHENTICATION;
        message = 'Token expired';
      } else if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        category = ErrorCategory.VALIDATION;
      }

    } else {
      // Bilinmeyen hata tipi
      message = 'Unknown error occurred';
      category = ErrorCategory.UNKNOWN;
      level = ErrorLevel.FATAL;
    }

    // User ID'yi request'ten al (eğer authentication yapılmışsa)
    const userId = (request as any).user?.id || (request as any).user?._id;

    // Error'u database'e log et
    try {
      await this.errorLoggingService.logError({
        message,
        level,
        category,
        statusCode: status,
        stack: exception instanceof Error ? exception.stack : undefined,
        userId,
        correlationId,
        request,
        response,
        metadata: {
          service: 'GlobalExceptionFilter',
          exceptionType: exception?.constructor?.name,
          details
        }
      });
    } catch (logError) {
      // Logging hatası durumunda sadece console'a yaz
      this.logger.error('Failed to log exception to database:', logError);
    }

    // Response formatı
    const errorResponse = {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? {
        type: exception?.constructor?.name,
        details,
        stack: exception instanceof Error ? exception.stack : undefined
      } : undefined,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      ...(details && { validationErrors: details.validationErrors })
    };

    // Console'a da log et (development)
    if (process.env.NODE_ENV === 'development') {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : exception
      );
    }

    response.status(status).json(errorResponse);
  }

  // HTTP status koduna göre kategori belirleme
  private getHttpErrorCategory(status: number): ErrorCategory {
    if (status === 400) return ErrorCategory.VALIDATION;
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status >= 400 && status < 500) return ErrorCategory.BUSINESS_LOGIC;
    if (status >= 500) return ErrorCategory.SYSTEM;
    return ErrorCategory.UNKNOWN;
  }
}
