import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { hashPassword } from 'src/globals/helpers/password.helpers';
import { PrismaService } from 'src/globals/services/prisma.service';
import { ResponseService } from 'src/globals/services/response.service';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private responses: ResponseService,
    private prisma: PrismaService,
  ) {}

  @Get('/createAdmin')
  async createAdmin() {
    await this.prisma.admin.create({
      data: {
        password: hashPassword('Default@123'),
        Role: {
          connectOrCreate: {
            create: { nameEn: 'Admin', nameAr: 'Admin' },
            where: { id: 1 },
          },
        },
        User: {
          create: {
            name: 'Admin',
          },
        },
      },
    });
  }
}
