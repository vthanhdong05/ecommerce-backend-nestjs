import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';
import { User } from 'src/apps/users/entities/user.entity';
import { DateUtilService } from '../utils/date-util/date-util.service';
import { StringUtilService } from '../utils/string-util/string-util.service';

@Injectable()
// Kế thừa PrismaClient
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private _extended!: ReturnType<typeof this.initExtended>; // _extended = Prisma sau khi đã $extends, có kiểu trả về của hàm initExtended()

  constructor(
    private dateUtilService: DateUtilService,
    private stringUtilService: StringUtilService,
  ) {
    super({
      transactionOptions: {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    });
    this.initExtended(); // khởi tạo Prisma đã extend
  }

  private getCurrentUser(value) {
    return value.user?.userEmail ?? value.user?.email ?? value.email ?? value.userEmail;
  }

  // setCreatedBy() – auto thêm người tạo
  private setCreatedBy(value: any): any {
    const isArray = Array.isArray(value);
    if (isArray) {
      const result = value.map((value: Record<string, any>) => {
        const user = this.getCurrentUser(value);
        return { ...value, createdBy: user };
      });
      return result;
    }
    return { ...value, createdBy: this.getCurrentUser(value) };
  }

  // omitData() – xoá field không cần
  private omitData(value: any, excludeFields: string[] = []) {
    const isArray = Array.isArray(value);
    if (isArray) {
      const result = value.map((value: Record<string, any>) => omit(value, excludeFields));
      return result;
    }
    return omit(value, excludeFields);
  }

  // transferDataCreate() – pipeline xử lý data create
  private transferDataCreate(value) {
    const dataCreatedBy = this.setCreatedBy(value);
    const data: any = this.omitData(dataCreatedBy, ['user', 'id']);
    return data;
  }

  // generateData() – xử lý riêng từng model
  private generateData<T>(data: T, model: string) {
    const modelsGenSlug = [User.name];

    if (modelsGenSlug.includes(model)) {
      if (Array.isArray(data)) {
        return data.map((item) => ({
          ...item,
          ...(item['name'] && {
            slug: this.stringUtilService.toSlug(item['name']),
          }),
        })) as T;
      }
      if (data && data['name']) {
        return {
          ...data,
          slug: this.stringUtilService.toSlug(data['name']),
        };
      }
    }
    return data;
  }

  initExtended() {
    const extended = this.$extends({
      query: {
        $allModels: {
          findFirst: ({ args, query }) => {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          findMany: ({ args, query }) => {
            // (Không áp dụng với bảng trung gian)
            return query(args);
          },
          create: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            const transferData = this.transferDataCreate(generateData);
            args.data = transferData;
            return query(args);
          },
          createMany: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            const transferData = this.transferDataCreate(generateData);
            args.data = transferData;
            return query(args);
          },
          createManyAndReturn: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            const transferData = this.transferDataCreate(generateData);
            args.data = transferData;
            return query(args);
          },
          update: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            args.data = generateData;

            return query(args);
          },
          updateMany: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            args.data = generateData;

            return query(args);
          },
          count: ({ args, query }) => {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          upsert: ({ args, query, model }) => {
            const generateCreateData = this.generateData(args.create, model);
            const transferCreateData = this.transferDataCreate(generateCreateData);
            args.create = transferCreateData;

            const generateUpdateData = this.generateData(args.update, model);
            const transferUpdateData = this.transferDataCreate(generateUpdateData);
            args.update = transferUpdateData;
            return query(args);
            // áp dụng cả 2 trường hợp: insert mới, update nếu tồn tại
            // đảm bảo: luôn có slug, luôn có createdBy
          },
          delete: async ({ args, query, model }) => {
            const record = await extended[model].findUnique({
              where: args.where,
            });
            if (!record) {
              throw new NotFoundException(`${model} not found for delete`); // tránh xoá “ảo”
            }
            return query(args);
          },
        },
      },
      model: {
        // mọi model trong Prisma đều được gắn thêm các method này
        $allModels: {
          async export<T>(this: T, args: Prisma.Args<T, 'findMany'> = {} as any) {
            const context: any = Prisma.getExtensionContext(this);
            const FIELDS_EXCLUDE = ['id'];
            const defaultSelect = Object.keys(context.fields).reduce(
              (acc, field) => ({
                ...acc,
                [field]: FIELDS_EXCLUDE.includes(field) ? false : true,
              }),
              {},
            );
            if (args.include) {
              args.select = { ...defaultSelect, ...args.include };
              delete args.include;
            } else {
              args.select = { ...defaultSelect, ...(args.select ?? {}) };
            }
            const result = await context.findMany(args);
            return result;
          },
          async softDelete<T>(this: T, where: Prisma.Args<T, 'deleteMany'>['where']) {
            const context: any = Prisma.getExtensionContext(this);
            const result = await context.updateMany({
              data: { deletedAt: new Date() },
              where,
            });
            return result;
          },
          async restore<T>(this: T, where: Prisma.Args<T, 'updateMany'>['where']) {
            // khôi phục dữ liệu đã xoá mềm
            const context: any = Prisma.getExtensionContext(this);
            const result = await context.updateMany({
              data: { deletedAt: null },
              where,
            });
            return result;
          },
        },
      },
      result: {
        $allModels: {
          createdAt: {
            compute: ({ createdAt }) => this.dateUtilService.formatDate(createdAt),
          },
          updatedAt: {
            compute: ({ updatedAt }) => this.dateUtilService.formatDate(updatedAt),
          },
        },
      },
    });
    this._extended = extended;
    return extended;
  }

  get extended() {
    return this._extended;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
