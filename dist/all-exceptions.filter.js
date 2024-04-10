"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const my_logger_service_1 = require("./my-logger/my-logger.service");
const library_1 = require("@prisma/client/runtime/library");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter extends core_1.BaseExceptionFilter {
    constructor() {
        super(...arguments);
        this.logger = new my_logger_service_1.MyLoggerService(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const myResponseObj = {
            statusCode: 500,
            timeStamp: new Date().toISOString(),
            path: request.url,
            response: '',
        };
        if (exception instanceof common_1.HttpException) {
            myResponseObj.statusCode = exception.getStatus();
            myResponseObj.response = exception.getResponse();
        }
        else if (exception instanceof library_1.PrismaClientValidationError) {
            myResponseObj.statusCode = 422;
            myResponseObj.response = exception.message.replaceAll(/\n/g, '');
        }
        else {
            myResponseObj.statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            myResponseObj.response = 'Internal Server Error';
        }
        response.status(myResponseObj.statusCode).json(myResponseObj);
        this.logger.error(myResponseObj.response, AllExceptionsFilter_1.name);
        super.catch(exception, host);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map