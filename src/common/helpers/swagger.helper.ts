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
  const commonPaginationParams = [
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

  for (const [, pathItem] of Object.entries(doc.paths)) {
    // Add pagination params to GET endpoints without path params
    for (const method of ['get'] as const) {
      const operation = (pathItem as any)[method];
      if (!operation) continue;

      // Check if it's an options endpoint (ends with /options)
      const pathKey = Object.keys(doc.paths).find((k) => doc.paths[k] === pathItem);
      const isOptions = pathKey?.endsWith('/options');

      if (isOptions) {
        for (const param of commonOptionsParams) {
          const hasParam = operation.parameters?.some((p: any) => p.name === param.name);
          if (!hasParam) {
            operation.parameters = operation.parameters || [];
            operation.parameters.push(param);
          }
        }
      } else {
        // Add pagination for regular GET list endpoints
        const hasPage = operation.parameters?.some((p: any) => p.name === 'page');
        if (!hasPage) {
          for (const param of commonPaginationParams) {
            operation.parameters = operation.parameters || [];
            operation.parameters.push(param);
          }
        }
      }
    }
  }

  return doc;
}
