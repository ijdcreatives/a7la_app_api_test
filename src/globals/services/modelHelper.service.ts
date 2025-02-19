import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ModelHelperService {
  constructor(private readonly prisma: PrismaService) {}

  async checkNameUniqueness(
    nameAr: string,
    nameEn: string,
    model: keyof typeof this.modelMap,
  ): Promise<void> {
    const selectedModel = this.modelMap[model];
    if (!selectedModel) {
      throw new Error(`Invalid model: ${model}`);
    }

    const existingItem = await (selectedModel as any).findFirst({
      where: {
        OR: [{ nameAr: { equals: nameAr } }, { nameEn: { equals: nameEn } }],
      },
    });

    if (existingItem !== null) {
      throw new ConflictException(`${model} name already exists`);
    }
  }
  async localizedDto(obj: unknown) {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.endsWith('Default')) {
          const baseName = key.slice(0, -7);
          const enKey = `${baseName}En`;
          const arKey = `${baseName}Ar`;

          if (!(enKey in obj)) {
            obj[enKey] = obj[key];
          }

          if (!(arKey in obj)) {
            obj[arKey] = obj[key];
          }

          delete obj[key];
        }

        if (key.toLocaleLowerCase().endsWith('id')) {
          const id = obj[key];
          const model = key.slice(0, -2);
          await this.exist(id, model);
        }
      }
    }
    return obj;
  }
  async exist(id: Id, model: any) {
    const selectedModel = this.modelMap[model];

    if (!selectedModel) {
      throw new Error(`Invalid model: ${model}`);
    }

    const existingItem = await (selectedModel as any).findUnique({
      where: {
        id,
      },
    });

    if (existingItem === null) {
      throw new NotFoundException(`${model} not found`);
    }
    return existingItem;
  }

  private modelMap = {
    product: this.prisma.product,
    module: this.prisma.module,
    subCategory: this.prisma.category,
    category: this.prisma.category,
    store: this.prisma.store,
    addon: this.prisma.addon,
    variation: this.prisma.variation,
  };
}
