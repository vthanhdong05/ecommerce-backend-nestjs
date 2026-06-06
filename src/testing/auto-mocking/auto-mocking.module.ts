import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Module, ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ModuleMocker } from 'jest-mock';
import { PrismaService } from 'src/common/prisma/prisma.service';

// Tự động mock toàn bộ dependencies trong unit test, không cần khai báo mock thủ công

const moduleMocker = new ModuleMocker(global);

@Module({})
export class AutoMockingModule {
  static async createTestingModule(metadata: ModuleMetadata) {
    return Test.createTestingModule(metadata)
      .useMocker((instance) => {
        if (typeof instance === 'function') {
          if (instance.name === PrismaService.name) {
            return new (instance as new () => unknown)();
          }

          const mockMetadata = moduleMocker.getMetadata(instance);
          if (!mockMetadata) return undefined;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new (Mock as new () => unknown)();
        }

        if (instance === CACHE_MANAGER) {
          return {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          };
        }
      })
      .compile();
  }
}
