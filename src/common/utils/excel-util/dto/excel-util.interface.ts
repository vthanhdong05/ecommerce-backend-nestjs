interface GenerateExcelParams {
  // danh sách các sheet trong file Excel
  worksheets: {
    sheetName?: string;
    data: any[];
    fieldsExclude?: string[];
    fieldsMapping?: Record<string, string>;
    fieldsExtend?: string[];
  }[];
}

type File = Express.Multer.File; // kiểu file upload từ Multer

export type { File, GenerateExcelParams };
