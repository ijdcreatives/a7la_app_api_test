export function search<T>(
  filters: Partial<{
    [key in keyof T]: any[] | number[] | Id | string | boolean;
  }>,
  key: keyof T,
) {
  if (Array.isArray(filters[key as string])) {
    return filters[key as string]?.map((value: any) => {
      const condition =
        typeof value === 'number' ? { equals: value } : { contains: value };
      return { OR: [{ [key]: condition }] };
    });
  } else {
    const value = filters[key as string];
    if (value !== undefined) {
      const condition =
        typeof value === 'number' ? { equals: value } : { contains: value };
      return [{ [key]: condition }];
    }
    return undefined;
  }
}

export function filterKey<T>(
  filters: Partial<{
    [key in keyof T]: any[] | number[] | Id | string | boolean;
  }>,
  key: keyof T,
) {
  if (Array.isArray(filters[key])) {
    return filters[key]?.length ? { [key]: { in: filters[key] } } : undefined;
  } else {
    return filters[key] !== undefined
      ? { [key]: { equals: filters[key] } }
      : undefined;
  }
}

export function orderKey<T>(
  flag: string,
  field: string | keyof T,
  body?: any,
):
  | { [key: string]: { [key: string]: 'asc' | 'desc' } }
  | { [key: string]: 'asc' | 'desc' }
  | undefined {
  const parts = String(field).split('.');
  if (
    parts.length > 1 &&
    body?.find((item) => item[flag] !== undefined)?.[flag] !== undefined
  ) {
    const result = parts.reduceRight<{ [key: string]: any } | undefined>(
      (acc, part, index) => {
        if (index === parts.length - 1) {
          return {
            [part]: body?.find((item) => item[flag] !== undefined)?.[flag],
          };
        } else {
          return { [part]: { ...acc } };
        }
      },
      {},
    );

    return result;
  } else {
    const fieldValue = body?.find((item) => item[flag] !== undefined)?.[flag];
    return fieldValue !== undefined
      ? { [String(field)]: fieldValue }
      : undefined;
  }
}

export function composedOrderKey(
  flag: string,
  field: any,
  index: number,
  body?: any,
):
  | { [key: string]: { [key: string]: 'asc' | 'desc' } }
  | { [key: string]: 'asc' | 'desc' }
  | undefined {
  if (typeof field === 'object') {
    const fieldValue = body?.find((item) => item[flag] !== undefined)?.[flag];
    if (fieldValue === undefined) return undefined;

    // Handle nested path case (e.g., Store.{startDate,endDate})
    const [prefix, ...rest] = Object.keys(field)[0].split('.');
    if (rest.length) {
      return {
        [prefix]: Object.keys(field).reduce(
          (acc, key) => ({
            ...acc,
            [key.split('.').pop()!]: fieldValue,
          }),
          {},
        ),
      };
    }

    // Handle flat case (e.g., {startDate,endDate}) - only use first key
    const firstKey = Object.keys(field)[index];
    return {
      [firstKey.split('.').pop()!]: fieldValue,
    };
  }
  const parts = String(field).split('.');
  if (
    parts.length > 1 &&
    body?.find((item) => item[flag] !== undefined)?.[flag] !== undefined
  ) {
    const result = parts.reduceRight<{ [key: string]: any } | undefined>(
      (acc, part, index) => {
        if (index === parts.length - 1) {
          return {
            [part]: body?.find((item) => item[flag] !== undefined)?.[flag],
          };
        } else {
          return { [part]: { ...acc } };
        }
      },
      {},
    );

    return result;
  } else {
    const fieldValue = body?.find((item) => item[flag] !== undefined)?.[flag];
    return fieldValue !== undefined
      ? { [String(field)]: fieldValue }
      : undefined;
  }
}

export function betweenDates<T>(key: keyof T, start?: Date, end?: Date) {
  return {
    [key]: { gte: start, lte: end },
  };
}
