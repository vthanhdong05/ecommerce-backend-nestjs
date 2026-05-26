import { INestApplication } from '@nestjs/common';
import { applyMiddleware } from './common/middleware/common.middleware';

const initApp = (app: INestApplication) => {
  applyMiddleware(app);
  return app;
};
export { initApp };
