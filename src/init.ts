import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc, ZodValidationPipe } from 'nestjs-zod';
import { addMissingPathParams, addMissingQueryParams } from './common/helpers/swagger.helper';
import { applyMiddleware } from './common/middleware/common.middleware';

const initOpenAPI = (app: INestApplication) => {
  const { APP_NAME } = process.env;
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${APP_NAME} API`)
      .setDescription(`${APP_NAME} API description`)
      .setVersion('1.0.0')
      .build(),
  );
  const cleanedDoc = cleanupOpenApiDoc(openApiDoc);
  const docWithPathParams = addMissingPathParams(cleanedDoc);
  const docWithAllParams = addMissingQueryParams(docWithPathParams);

  SwaggerModule.setup('api-docs', app, docWithAllParams);
};

const initApp = (app: INestApplication) => {
  const { APP_PREFIX = '/api', FE_URL } = process.env;
  app.setGlobalPrefix(APP_PREFIX);
  if (FE_URL) {
    app.enableCors({
      origin: FE_URL, // FE_URL dùng để cấu hình CORS, cho phép frontend truy cập backend một cách an toàn.
      credentials: true,
    });
  }
  applyMiddleware(app);
  initOpenAPI(app);

  app.useGlobalPipes(new ZodValidationPipe());

  app.enableShutdownHooks();

  return app;
};
export { initApp };
