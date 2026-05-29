import { CreateMatchDto } from "./dto/create-match.dto";
import { UpdateMatchDto } from "./dto/update-match.dto";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";

interface FindAllParams {
  skip?: number;
  take?: number;
  include?: any;
  where?: any;
  orderBy?: any;
}

export class MatchesService {
  async findAll(params: FindAllParams) {
    const { skip, take, include, where, orderBy } = params;

    // Базовый запрос
    const query: any = {};

    if (skip !== undefined) query.skip = +skip;
    if (take !== undefined) query.take = +take;
    if (include) query.include = include;
    if (where) query.where = where;
    if (orderBy) query.orderBy = orderBy;

    // Если не включен tournament, добавляем по умолчанию для отображения названия
    if (!query.include || !query.include.tournament) {
      query.include = {
        ...query.include,
        tournament: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      };
    }

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

  async update(id: string, updateMatchDto: UpdateMatchDto) {
    return prisma.match.update({
      where: { id },
      data: updateMatchDto,
    });
  }

  async remove(id: string) {
    return prisma.match.deleteMany({
      where: { id },
    });
  }
}
