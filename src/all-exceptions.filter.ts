import { Catch, ArgumentsHost, HttpStatus, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from "express";
import { MyLoggerService } from "./my-logger/my-logger.service";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

type MyResponceObj = {
  statusCode: number,
  timeStamp: string,
  path: string,
  responce: string | object,
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const responce = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const myResponceObj: MyResponceObj = {
      statusCode: 500,
      timeStamp: new Date().toISOString(),
      path: request.url,
      responce: '',
    }
    if (exception instanceof HttpException) {
      myResponceObj.statusCode = exception.getStatus();
      myResponceObj.responce = exception.getResponse();
    } else if (exception instanceof PrismaClientValidationError) {
      myResponceObj.statusCode = 422;
      myResponceObj.responce = exception.message.replaceAll(/\n/g, '');
    } else {
      myResponceObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponceObj.responce = 'Internal Server Error';
    }
    responce.status(myResponceObj.statusCode).json(myResponceObj);
    this.logger.error(myResponceObj.responce, AllExceptionsFilter.name);
    super.catch(exception, host);
  }
}
