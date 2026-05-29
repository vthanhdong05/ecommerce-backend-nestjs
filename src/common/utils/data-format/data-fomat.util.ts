// src/common/utils/route.util.ts
export function normalizeRoute(route: string): string {
  return route.replace(/[[\]]/g, '');
}

export function parseAttributes(attributes: unknown): Record<string, string> | null {
  if (!attributes || typeof attributes !== 'string') return null;

  return attributes.split(',').reduce(
    (acc, pair) => {
      const [key, value] = pair.split(':').map((s) => s.trim());
      if (key && value) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
}
