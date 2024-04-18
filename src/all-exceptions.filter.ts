import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response, Request } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { MyLoggerService } from './my-logger/my-logger.service';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const myResponseObj: any = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timeStamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      response: 'Internal Server Error',
    };

    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    } else if (exception instanceof PrismaClientValidationError) {
      myResponseObj.statusCode = 422;
      myResponseObj.response = 'Data validation failed - check your inputs.';
    } else if (exception instanceof ThrottlerException) {
      myResponseObj.statusCode = HttpStatus.TOO_MANY_REQUESTS;
      myResponseObj.response = 'Too many requests, please try again later.';
    }

    this.logger.error(
      `Error Response: ${JSON.stringify({
        path: myResponseObj.path,
        method: myResponseObj.method,
        message: myResponseObj.response,
      })}`,
      AllExceptionsFilter.name
    );

    response.status(myResponseObj.statusCode).json(myResponseObj);
    // No call to super.catch() to prevent double handling
  }
}
