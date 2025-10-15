import { prisma } from "../prisma";

interface FindAllParams {
  skip?: number;
  take?: number;
}

export class MatchesService {
  async findAll(params: FindAllParams) {
    const { skip, take } = params;

    // Базовый запрос
    const query: FindAllParams = {};

    if (skip !== undefined) query.skip = +skip;
    if (take !== undefined) query.take = +take;
    /*
    if (include) query.include = include;
    if (where) query.where = where;
    if (orderBy) query.orderBy = orderBy;*/

    // Если не включен tournament, добавляем по умолчанию для отображения названия

    try {
      const matches = await prisma.match.findMany(query);

      return {
        matches,
        skip: skip || 0,
        take: take || 10,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }
  }

  async checkOne(id: string) {
    return await prisma.match.findUnique({
      where: { id },
    });
  }
}
