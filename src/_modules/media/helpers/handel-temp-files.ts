import {
  isMulterFile,
  isMulterFiles,
  isMulterFilesObject,
} from './check-file-type';
import { HandelFiles } from './handel-types';
import { renameFile } from './rename-file';

export function handelSucceededTemp(
  file_s:
    | string
    | string[]
    | UploadedFile
    | UploadedFile[]
    | { [key: string]: UploadedFile[] },
  baseFolder?: string | number,
) {
  const handelPath = new HandelFiles(baseFolder);

  if (isMulterFilesObject(file_s))
    return handelPath.handelFilesObjectTemp(file_s);

  if (isMulterFile(file_s)) return handelPath.handelFileTemp(file_s);

  if (isMulterFiles(file_s)) {
    return file_s.map((file) => {
      if (file) return handelSucceededTemp(file, baseFolder);
    });
  }

  if (typeof file_s === 'string') {
    return renameFile(file_s, HandelFiles.path(file_s, baseFolder));
  }

  if (Array.isArray(file_s)) {
    file_s.forEach((file) => {
      if (file) renameFile(file, HandelFiles.path(file, baseFolder));
    });
  }
}
