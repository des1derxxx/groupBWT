import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let errorResponse;

    switch (exception.code) {
      case 'P2002':
        errorResponse = new ConflictException(
          'Запись с такими данными уже существует',
        );
        break;

      case 'P2025':
        errorResponse = new NotFoundException('Запись не найдена');
        break;

      case 'P2003':
        errorResponse = new BadRequestException('Ошибка внешнего ключа');
        break;

      case 'P2004': {
        if (exception.meta?.constraint === 'images_count_non_negative') {
          errorResponse = new BadRequestException(
            'Количество изображений не может быть меньше 0',
          );
        } else {
          errorResponse = new BadRequestException(
            'Нарушено ограничение целостности данных',
          );
        }
        break;
      }

      default:
        errorResponse = new InternalServerErrorException(
          `Ошибка базы данных: ${exception.code}`,
        );
    }

    response.status(errorResponse.getStatus()).json({
      statusCode: errorResponse.getStatus(),
      message: errorResponse.message,
    });
  }
}
