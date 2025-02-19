import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DMMF } from '@prisma/client/runtime/library';
import { getDMMF } from '@prisma/internals';
import { promises as fs } from 'fs';
import * as path from 'path';
import { softDeleteMiddleware } from '../middlewares/prisma.softdelete.middleware';

const SCHEMA_DIR = path.join(__dirname, '../../../prisma/schema');
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private dmmf: DMMF.Document;
  constructor() {
    console.log(SCHEMA_DIR);
    super();
    this.$use(async (params, next) => {
      // if (
      //   params.action === 'findMany' ||
      //   params.action === 'count' ||
      //   params.action === 'aggregate'
      // ) {
      //   // Ensure the query filters out soft deleted posts
      //   if (!params.args.where) {
      //     params.args.where = {};
      //   }
      //   params.args.where.deletedAt = null;
      // }

      const result = await next(params);

      if (result && typeof result === 'object') {
        for (const key in result) {
          if (result[key] instanceof Prisma.Decimal) {
            result[key] = parseFloat(result[key].toString());
          }
        }
      }

      return result;
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();

      this.$use(softDeleteMiddleware());

      const prismaFiles = await this.getPrismaFiles(SCHEMA_DIR);

      let combinedSchema = '';
      for (const file of prismaFiles) {
        const filePath = path.join(file);
        const schemaContent = await fs.readFile(filePath, 'utf-8');
        combinedSchema += schemaContent + '\n\n';
      }

      this.dmmf = await getDMMF({ datamodel: combinedSchema });
    } catch (error) {
      catchHandler(error);
      // eslint-disable-next-line no-console
      console.error('Error connecting to database');
    }
  }
  getFieldMapping(
    modelName: string,
    columnName?: string,
  ): Record<string, string> {
    const model = this.dmmf.datamodel.models.find((m) => m.name === modelName);

    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    const mapping: Record<string, string> = {};
    model.fields.forEach((field) => {
      const fieldName = field.name;
      const columnName = field.dbName ?? fieldName;
      mapping[fieldName] = columnName;
    });
    if (columnName) {
      return { [columnName]: mapping[columnName] || null };
    }
    return mapping;
  }

  //   private generateWhereClause(filters: any): string {
  //     const conditions = [];

  //     conditions.push(`s.status = 'ACTIVE'`);

  //     if (filters.homeDelivery !== undefined) {
  //       conditions.push(`s.home_delivery = ${filters.homeDelivery}`);
  //     }
  //     if (filters.takeAway !== undefined) {
  //       conditions.push(`s.take_away = ${filters.takeAway}`);
  //     }

  //     return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  //   }

  private async getPrismaFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const res = path.resolve(dir, entry.name);
        return entry.isDirectory() ? this.getPrismaFiles(res) : res;
      }),
    );
    return files.flat().filter((file) => file.endsWith('.prisma'));
  }

  getTypeScriptType(fieldType: string) {
    switch (fieldType) {
      case 'Int':
        return 'number';
      case 'String':
        return 'string';
      case 'Boolean':
        return 'boolean';
      case 'DateTime':
        return 'Date';
      default:
        return fieldType;
    }
  }

  async validateUnique<ModelName extends keyof PrismaClient>(
    modelName: ModelName,
    colName: string,
    value: any,
    options?: any,
  ) {
    const model = this.dmmf.datamodel.models.find(
      (m) => m.name === modelName.toString().capitalFirstLetter(),
    );
    if (!model) {
      throw new Error('Model not found');
    }

    const field = model.fields.find((f) => f.name === colName);
    if (!field) {
      throw new Error('Field not found');
    }

    const count = await this[modelName as string].count({
      ...options,
      where: { [colName]: value, ...options?.where },
    });

    if (count > 0) {
      throw new BadRequestException(
        `this ${modelName.toString()} with ${colName} '${value}' already exists`,
      );
    }
  }

  async returnUnique<ModelName extends keyof PrismaClient>(
    modelName: ModelName,
    colName: string,
    value: any,
    options?: any,
  ) {
    const model = this.dmmf.datamodel.models.find(
      (m) => m.name === modelName.toString().capitalFirstLetter(),
    );
    if (!model) {
      throw new Error('Model not found');
    }
    const field = model.fields.find((f) => f.name === colName);
    if (!field) {
      throw new Error('Field not found');
    }
    const exist = await this[modelName as string].findUnique({
      ...options,
      where: { [colName]: value, ...options?.where },
    });
    if (!exist) {
      throw new NotFoundException(
        `${modelName.toString()} with ${colName} '${value}' not found`,
      );
    }

    return exist;
  }

  async getSchemeObject(): Promise<SchemeObject> {
    return this.dmmf.datamodel.models.map((model) => {
      return {
        name: model.name,
        cols: model.fields.map((field) => {
          return {
            colName: field.name,
            colType: this.getTypeScriptType(field.type),
            allowNull: !field.isRequired,
            unique: field.isUnique,
            isId: field.isId,
            defaultValue: field.default || null,
          };
        }),
      };
    });
  }

  async validateBody(obj: unknown) {
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
          if (model in this) {
            await this.returnUnique(model as keyof PrismaClient, 'id', id);
          }
        }
      }
    }
    return obj;
  }
}
