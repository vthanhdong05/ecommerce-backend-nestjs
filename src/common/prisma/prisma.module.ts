import { Global, Module } from '@nestjs/common';
import { DateUtilModule } from '../utils/date-util/date-util.module';
import { DateUtilService } from '../utils/date-util/date-util.service';
import { StringUtilModule } from '../utils/string-util/string-util.module';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [DateUtilModule, StringUtilModule],
  controllers: [],
  providers: [PrismaService, DateUtilService],
  exports: [PrismaService, DateUtilService],
})
export class PrismaModule {}
