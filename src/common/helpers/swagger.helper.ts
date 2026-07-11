import type { OpenAPIObject } from '@nestjs/swagger';

export function addMissingPathParams(doc: OpenAPIObject): OpenAPIObject {
  const pathParamRegex = /\{([^}]+)\}/g;

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    let match;
    while ((match = pathParamRegex.exec(path)) !== null) {
      const paramName = match[1];

      for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
        const operation = (pathItem as any)[method];
        if (!operation) continue;

        const hasParam = operation.parameters?.some(
          (p: any) => p.name === paramName && p.in === 'path',
        );

        if (!hasParam) {
          operation.parameters = operation.parameters || [];
          operation.parameters.push({
            name: paramName,
            in: 'path',
            required: true,
            schema: { type: 'string' },
          });
        }
      }
    }
  }

  return doc;
}

export function addMissingQueryParams(doc: OpenAPIObject): OpenAPIObject {
  const commonOptionsParams = [
    {
      name: 'limit',
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 10 },
      description: 'Max results to return',
    },
    {
      name: 'select',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: 'Fields to select (comma-separated)',
    },
    {
      name: 'q',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: 'Search query',
    },
  ];

  const paginationParams = [
    {
      name: 'page',
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 1 },
      description: 'Page number',
    },
    {
      name: 'itemPerPage',
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 10 },
      description: 'Items per page',
    },
  ];

  const excludePatterns = ['/health', '/api', '/profile', '/return'];

  const shouldExcludePagination = (path: string): boolean => {
    return excludePatterns.some((pattern) => {
      if (pattern.startsWith('/')) {
        return path.endsWith(pattern);
      }
      return path.includes(pattern);
    });
  };

  const isListEndpoint = (path: string): boolean => {
    const pathParamRegex = /\{[^}]+\}/g;
    const hasPathParams = pathParamRegex.test(path);
    const isExport = path.includes('/export');
    const isOptions = path.endsWith('/options');

    return !hasPathParams && !isExport && !isOptions;
  };

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    const isOptions = path.endsWith('/options');
    const operation = (pathItem as any).get;

    if (!operation) continue;

    if (isOptions) {
      for (const param of commonOptionsParams) {
        const hasParam = operation.parameters?.some((p: any) => p.name === param.name);
        if (!hasParam) {
          operation.parameters = operation.parameters || [];
          operation.parameters.push(param);
        }
      }
    } else if (isListEndpoint(path) && !shouldExcludePagination(path)) {
      const hasPage = operation.parameters?.some((p: any) => p.name === 'page');
      if (!hasPage) {
        operation.parameters = operation.parameters || [];
        for (const param of paginationParams) {
          operation.parameters.push(param);
        }
      }
    }
  }

  return doc;
}
