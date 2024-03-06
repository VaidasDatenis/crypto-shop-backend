"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./all-exceptions.filter");
const helmet_1 = require("helmet");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const { httpAdapter } = app.get(core_1.HttpAdapterHost);
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(httpAdapter));
    app.enableCors();
    app.setGlobalPrefix('api');
    app.use((0, helmet_1.default)());
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map