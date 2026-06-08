import { ExcelUtilService } from 'src/common/utils/excel-util/excel-util.service';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { ProductCategoriesService } from './product-categories.service';

describe('ProductCategoriesService', () => {
  let service: ProductCategoriesService;
  let excelUtilService: jest.Mocked<ExcelUtilService>;

  beforeEach(async () => {
    const module = await AutoMockingModule.createTestingModule({
      providers: [ProductCategoriesService],
    });

    service = module.get(ProductCategoriesService);
    excelUtilService = module.get(ExcelUtilService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductCategories', () => {
    it('should return product categories', async () => {
      const findManySpy = jest.spyOn(service.extended, 'findMany').mockResolvedValue([
        {
          product: {
            id: 'p1',
            name: 'Laptop',
            description: 'Laptop',
          },
          category: {
            id: 'c1',
            name: 'Electronics',
            description: 'Electronics',
          },
        },
      ] as never);

      const result = await service.getProductCategories();

      expect(findManySpy).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('exportProductCategories', () => {
    it('should export product categories', async () => {
      const workbook = {} as never;

      const exportSpy = jest.spyOn(service.extended, 'export').mockResolvedValue([] as never);

      const generateExcelSpy = jest
        .spyOn(excelUtilService, 'generateExcel')
        .mockReturnValue(workbook);

      const result = await service.exportProductCategories({
        productIDs: [],
        categoryIDs: [],
      });

      expect(exportSpy).toHaveBeenCalled();
      expect(generateExcelSpy).toHaveBeenCalled();
      expect(result).toBe(workbook);
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
