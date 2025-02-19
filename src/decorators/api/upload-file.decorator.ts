import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadTypes } from 'src/_modules/media/configs/upload.config';
import { v4 } from 'uuid';

export const uploadOptions = (
  filePath: string,
  type?: UploadTypes,
  fileType?: string,
) => {
  let fileKey = '';

  const uploadOptions = {
    fileFilter: (
      _req: any,
      file: { fieldname: string; mimetype: string; size: number },
      callback: (arg0: null, arg1: boolean) => void,
    ) => {
      fileKey = file.fieldname;
      if (fileType && !file.mimetype.startsWith(fileType)) {
        callback(null, false);
        return;
      }
      callback(null, true);
    },
    limits: { fileSize: 20 * 1024 * 1024 },

    storage: diskStorage({
      filename(_req, file, callback) {
        let fileName = '';
        if (type === 'many')
          fileName =
            env('TEMP_FILE_KEY') +
            fileKey +
            '-' +
            v4() +
            path.extname(file.originalname);
        else
          fileName =
            env('TEMP_FILE_KEY') + v4() + path.extname(file.originalname);
        callback(null, fileName);
      },

      destination(_, __, callback) {
        const uploadPath = `${env('UPLOADS_PATH')}/${filePath}`;
        if (!existsSync(env('UPLOADS_PATH'))) {
          mkdirSync(env('UPLOADS_PATH'));
        }
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        callback(null, uploadPath);
      },
    }),
  };

  return uploadOptions;
};

export const UploadFiles = (
  key: string,
  filePath?: string,
  maxCount: number = 10,
) => {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(key, maxCount, uploadOptions(filePath, 'many')),
    ),
    ApiConsumes('multipart/form-data'),
  );
};

export const UploadMultipleFiles = (
  fields: {
    name: string;
    maxCount: number;
    filePath?: string;
    fileType?: string;
    fileSize?: number;
  }[],
) => {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(
        fields.map((field) => ({ name: field.name, maxCount: field.maxCount })),
        {
          limits: {
            fileSize: 20 * 1024 * 1024,
          },
          fileFilter: (
            _,
            file: { fieldname: string; mimetype: string; size: number },
            callback,
          ) => {
            const field = fields.find((f) => f.name === file.fieldname);
            if (!field) {
              return callback(
                new BadRequestException(`Unknown field: ${file.fieldname}`),
                false,
              );
            }
            if (field.fileType && !file.mimetype.startsWith(field.fileType)) {
              return callback(
                new BadRequestException(
                  `Invalid file type for ${file.fieldname}`,
                ),
                false,
              );
            }
            if (field.fileSize && file.size > field.fileSize) {
              return callback(
                new BadRequestException(
                  `File too large for ${file.fieldname}. Maximum allowed size is ${field.fileSize / (1024 * 1024)}MB.`,
                ),
                false,
              );
            }

            callback(null, true);
          },
          storage: diskStorage({
            destination: (_, file, callback) => {
              const field = fields.find((f) => f.name === file.fieldname);
              const uploadPath = `${env('UPLOADS_PATH')}/${field?.filePath || ''}`;
              if (!existsSync(env('UPLOADS_PATH'))) {
                mkdirSync(env('UPLOADS_PATH'));
              }
              if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
              }
              callback(null, uploadPath);
            },
            filename: (_, file, callback) => {
              const fileName = `${env('TEMP_FILE_KEY')}${file.fieldname}-${v4()}${path.extname(file.originalname)}`;
              callback(null, fileName);
            },
          }),
        },
      ),
    ),
    ApiConsumes('multipart/form-data'),
  );
};

export const UploadFile = (key: string, filePath?: string) => {
  return applyDecorators(
    UseInterceptors(FileInterceptor(key, uploadOptions(filePath))),
    ApiConsumes('multipart/form-data'),
  );
};
