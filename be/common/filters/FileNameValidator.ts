import { FileValidator } from '@nestjs/common';
import type { Multer } from 'multer';

export class FileNameValidator extends FileValidator<{
  regex?: RegExp;
}> {
  isValid(file?: Express.Multer.File): boolean {
    if (!file) return true;

    const regex =
      this.validationOptions.regex ?? /^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/;

    return regex.test(file.originalname);
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `Недопустимое имя файла "${file.originalname}". Используйте только английские буквы, цифры, точки, дефисы и подчёркивания`;
  }
}
