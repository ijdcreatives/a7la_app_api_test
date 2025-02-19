import { Prisma } from '@prisma/client';

export function softDeleteMiddleware<
  T extends Prisma.BatchPayload = Prisma.BatchPayload,
>(): Prisma.Middleware {
  return async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<T>,
  ): Promise<T> => {
    const dates = Prisma.dmmf?.datamodel?.models
      .find((m) => m.name === params.model)
      ?.fields.filter((field) => field.name.endsWith('At'));

    const modelHasDeletedAt =
      dates?.some((field) => field.name === 'deletedAt') ?? false;

    if (params.action === 'delete' && modelHasDeletedAt) {
      params.action = 'update';
      params.args = { ...params?.args, data: { deletedAt: new Date() } };
    }
    if (
      (params.action === 'findMany' || params.action === 'count') &&
      modelHasDeletedAt
    ) {
      const omittedDates = {};
      dates?.forEach((date) => {
        omittedDates[date.name] = true;
      });
      params.args = {
        ...params.args,
        where: { deletedAt: null, ...params?.args?.where },
        omit:
          params?.args?.select || params?.action === 'count'
            ? undefined
            : {
                ...omittedDates,
                ...params?.args?.omit,
              },
      };
    }
    const result = await next(params);
    return result;
  };
}
