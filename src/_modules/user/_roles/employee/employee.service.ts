import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Roles, RoleType } from '@prisma/client';
import { userJoinedRole } from 'src/_modules/authentication/helpers/role-helper';
import { handelSucceededTemp } from 'src/_modules/media/helpers/handel-temp-files';
import { HandelFiles } from 'src/_modules/media/helpers/handel-types';
import { firstOrMany } from 'src/globals/helpers/first-or-many';
import { localizedObject } from 'src/globals/helpers/localized.return';
import { hashPassword } from 'src/globals/helpers/password.helpers';
import { PrismaService } from 'src/globals/services/prisma.service';
import { UserService } from '../../user.service';
import {
  CreateEmployeeDTO,
  FilterEmployeeDTO,
  UpdateEmployeeDTO,
} from './dto/register.dto';
import { getEmployeeArgs } from './prisma-args/employee.prisma-args';
@Injectable()
export class EmployeeService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  async register(
    body: CreateEmployeeDTO,
    role: Role,
    file: UploadedFile,
    storeId?: Id,
  ) {
    const { roleId, password, ...userBody } = body;
    const model = userJoinedRole(role.baseRole);
    const user = await this.UserRoleExist(body, role.baseRole);
    const Role = await this.prisma.role.findUnique({ where: { id: roleId } });
    const hashedPassword = hashPassword(password);
    this.validateRoleType(role, Role, storeId);
    if (body.image) this.generateFilePaths(file, userBody);
    const newUser =
      user && user[model]
        ? user.id
        : await this.createUserAndRole(
            userBody,
            model,
            roleId,
            hashedPassword,
            storeId,
          );
    if (user) {
      await this.prisma[model].update({
        where: { id: user.id },
        data: {
          email: body.email,

          User: {
            firstName: body.firstName,
            lastName: body.lastName,
          },
        },
      });
    }
    handelSucceededTemp(file, body.firstName + body.lastName);
    return newUser;
  }

  async findAll(
    locale: Locale,
    filters: FilterEmployeeDTO,
    role: Role,
    storeId: Id,
  ) {
    const model = userJoinedRole(role.baseRole);
    const data = await this.prisma[model][firstOrMany(filters?.id)]({
      ...getEmployeeArgs(filters, locale, storeId, role.baseRole),
      select: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        Role: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            type: true,
          },
        },
      },
    });

    const total = await this.prisma[model].count({
      ...getEmployeeArgs(filters, locale, storeId, role.baseRole),
    });
    return {
      data: localizedObject(data, locale),
      total,
    };
  }

  async update(
    body: UpdateEmployeeDTO,
    id: Id,
    role: Role,
    file: UploadedFile,
    locale: Locale,
    storeId?: Id,
  ) {
    if (storeId) await this.validateEmployeeAccess(id, role.baseRole, storeId);
    if (body.roleId) {
      const Role = await this.prisma.role.findUnique({
        where: { id: body.roleId },
      });
      this.validateRoleType(role, Role, storeId);
    }
    if (body.email || body.phone) {
      await this.userService.validateUniqueValues(body, locale, Roles.VENDOR, {
        phone: body.phone,
        email: body.email,
      });
    }
    await this.prisma.$transaction(async (prisma) => {
      const { password, roleId, ...userBody } = body;
      if (file) this.generateFilePaths(file, userBody);

      const model = userJoinedRole(role.baseRole);
      await prisma[model].update({
        where: { id },
        data: {
          ...userBody,
        },
      });
      if (password) {
        await prisma[model].update({
          where: { id },
          data: {
            password: hashPassword(password),
          },
        });
      }
      if (file)
        handelSucceededTemp(
          file,
          body.firstName && body.lastName
            ? body.firstName + body.lastName
            : 'Edit',
        );
    });
  }

  async delete(id: Id, role: Role) {
    const model = userJoinedRole(role.baseRole);
    const data = await this.prisma[model].findUnique({
      where: { id },
      select: {
        Role: {
          select: {
            type: true,
          },
        },
      },
    });
    this.validateRole(data);
    await this.prisma[model].delete({ where: { id } });
  }

  private validateRole(employee: any) {
    if (employee.Role.type === RoleType.SYSTEM)
      throw new ConflictException('Cannot Access This Resource');
  }
  private async validateEmployeeAccess(id: Id, role: Roles, storeId: Id) {
    const employee = await this.prisma[userJoinedRole(role)].findUnique({
      where: { id },
      select: {
        storeId: true,
        Role: {
          select: {
            type: true,
          },
        },
      },
    });
    this.validateRole(employee);
    if (!employee) throw new NotFoundException('Employee Not Found');
    if (role === Roles.VENDOR && employee['storeId'] !== storeId)
      throw new NotFoundException('Employee Not Found');
  }

  async UserRoleExist(
    body: CreateEmployeeDTO | UpdateEmployeeDTO,
    role: Roles,
  ) {
    const model = userJoinedRole(role);
    const user = await this.prisma[model].findFirst({
      where: {
        OR: [{ phone: body.phone }, { email: body.email }],
      },
      select: {
        id: true,
        Admin: true,
        Vendor: {
          select: {
            storeId: true,
          },
        },
      },
    });
    if (role === Roles.ADMIN && user?.Admin)
      throw new ConflictException('User Already Have Role');

    return user;
  }

  private validateRoleType(role: Role, Role: any, storeId: Id) {
    if (
      role.baseRole === Roles.ADMIN &&
      (Role.type !== RoleType.ADMIN || Role.type === RoleType.SYSTEM)
    )
      throw new NotFoundException('Role Not Found');
    else if (
      role.baseRole === Roles.VENDOR &&
      (Role.type !== RoleType.STORE ||
        storeId !== Role.storeId ||
        Role.type === RoleType.SYSTEM)
    )
      throw new NotFoundException('Role Not Found');
  }

  private generateFilePaths(
    file: UploadedFile,
    body: CreateEmployeeDTO | UpdateEmployeeDTO,
  ) {
    HandelFiles.generatePath<
      { image?: UploadedFile },
      CreateEmployeeDTO | UpdateEmployeeDTO
    >(
      { image: file },
      body,
      body.firstName && body.lastName ? body.firstName + body.lastName : 'Edit',
    );
  }

  private async createUserAndRole(
    userBody: any,
    model: string,
    roleId: Id,
    hashedPassword: string,
    storeId?: Id,
  ) {
    return await this.prisma.$transaction(async (prisma) => {
      const { id } = await this.userService.createUser(
        prisma,
        userBody,
        Roles.VENDOR,
      );
      await prisma[model].create({
        data: {
          User: { connect: { id } },
          Role: { connect: { id: roleId } },
          Store: storeId ? { connect: { id: storeId } } : undefined,
          password: hashedPassword,
        },
      });
    });
  }
}
