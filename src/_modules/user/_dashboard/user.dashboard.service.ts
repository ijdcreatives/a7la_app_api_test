import { Injectable } from '@nestjs/common';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { PrismaService } from 'src/globals/services/prisma.service';
import { FilterUserDTO } from '../dto/filter.dto';
import { getArgs } from './user.dashboard.prisma.args';

@Injectable()
export class UserDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(filters: FilterUserDTO) {
    const args = getArgs(filters);

    const data = await this.prisma.user[firstOrMany(filters?.id?.length)](args);
    if (filters?.id?.length) return { data, total: undefined };

    const total = await this.prisma.user.count({ where: args.where });

    return { data, total };
  }
}
