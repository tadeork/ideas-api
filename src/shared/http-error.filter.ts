/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      code: status,
      timestamp: new Date().toLocaleDateString(),
      path: request.url,
      method: request.method,
      message:
        status !== HttpStatus.INTERNAL_SERVER_ERROR
          ? exception.message || null
          : 'Internal Server Error',
    };

    Logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'ExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }
}
