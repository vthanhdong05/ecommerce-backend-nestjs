import {
  BeforeApplicationShutdown,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class AppService
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    BeforeApplicationShutdown,
    OnModuleDestroy
{
  onModuleInit() {}
  onApplicationBootstrap() {
    // console.log('>>> onApplicationBootstrap');
  }
  onModuleDestroy() {}

  // only work if app.enableShutdownHooks();
  beforeApplicationShutdown(_signal?: string) {
    // console.log('>>> beforeApplicationShutdown');
  }
  onApplicationShutdown(_signal?: string) {
    // console.log('>>> onApplicationShutdown');
  }
  health() {
    return 'OK';
  }

  getHello(): string {
    return 'Hello World!';
  }
}
