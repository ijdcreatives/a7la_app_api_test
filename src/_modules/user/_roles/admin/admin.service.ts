import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { hashPassword } from 'src/globals/helpers/password.helpers';
import { PrismaService } from 'src/globals/services/prisma.service';
import { UserService } from '../../user.service';
import { AdminRegisterDTO } from './dto/register.dto';
@Injectable()
export class AdminService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  async register(body: AdminRegisterDTO) {
    const { role, ...userBody } = body;

    userBody.password = hashPassword(userBody.password);

    const { user, haveRole } = await this.userService.isUserExistAndHaveRole(
      userBody.email,
      Roles.ADMIN,
    );

    if (haveRole) return user;

    if (!user) {
      const newOne = await this.prisma.$transaction(async (prisma) => {
        const { id } = await this.userService.createUser(
          prisma,
          userBody,
          Roles.ADMIN,
        );
        await prisma.admin.create({
          data: { id, role: 1 },
        });
      });
      return newOne;
    }

    const newOne = await this.prisma.admin.create({
      data: { id: user.id, role: 1 },
    });

    return newOne;
  }
}
