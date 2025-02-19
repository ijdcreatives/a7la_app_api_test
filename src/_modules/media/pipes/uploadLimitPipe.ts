import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileLimitPipe implements PipeTransform {
  transform(
    files: UploadedFile | UploadedFile[],
  ): UploadedFile | UploadedFile[] {
    if (files === undefined || files === null) {
      throw new BadRequestException('file expected');
    }

    if (Array.isArray(files) && files.length === 0) {
      throw new BadRequestException('files expected');
    }

    return files;
  }
}
