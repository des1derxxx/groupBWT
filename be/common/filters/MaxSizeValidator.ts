import { FileValidator } from '@nestjs/common';
import type { Multer } from 'multer';

export class MaxSizeValidator extends FileValidator<{
  maxSize: number;
}> {
  isValid(file?: Express.Multer.File): boolean {
    if (!file) return true;
    return file.size <= this.validationOptions.maxSize;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `Файл "${file.originalname}" превышает допустимый размер ${Math.round(
      this.validationOptions.maxSize / 1024 / 1024,
    )} МБ`;
  }
}
