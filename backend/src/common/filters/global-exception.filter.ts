import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = HttpStatus[status] ?? 'HTTP_ERROR';
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const body = exceptionResponse as Record<string, unknown>;
        const rawMessage = body.message;
        if (typeof rawMessage === 'string' && rawMessage.trim()) {
          message = rawMessage;
        } else if (Array.isArray(rawMessage) && typeof rawMessage[0] === 'string') {
          message = rawMessage[0];
        }
        code =
          (typeof body.code === 'string' && body.code) ||
          (typeof body.error === 'string' && body.error) ||
          HttpStatus[status] ||
          'HTTP_ERROR';
        if (body.details !== undefined) {
          details = body.details;
        } else if (Array.isArray(body.errors)) {
          details = { errors: body.errors };
        } else if (body.errors && typeof body.errors === 'object') {
          details = {
            errors: Object.entries(body.errors as Record<string, unknown>).map(
              ([field, fieldMessage]) => ({
                field,
                message: String(fieldMessage),
              }),
            ),
          };
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    });
  }
}
