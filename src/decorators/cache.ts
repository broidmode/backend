import NodeCache from 'node-cache';

const nodeCache = new NodeCache({
  stdTTL: 60 * 60 * 12,
});

export function cache(cacheKey: string, ttl?: number) {
  return function(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const orig = descriptor.value as Function;
    descriptor.value = async function(...args: any[]) {
      const cacheResult = nodeCache.get<unknown>(cacheKey);
      if (cacheResult) {
        return cacheResult;
      }

      const result = await orig.apply(this, args);
      nodeCache.set<unknown>(cacheKey, result, ttl);

      return result;
    } as unknown as any;
  };
}
