import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MoveImageDto } from './dto/move-image.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Загрузить изображения' })
  @ApiResponse({
    status: 201,
    description: 'Изображения успешно загружены',
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const fileExt = file.originalname
          .toLowerCase()
          .slice(file.originalname.lastIndexOf('.'));

        if (
          allowedMimeTypes.includes(file.mimetype) &&
          allowedExtensions.includes(fileExt)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Можно загружать только файлы .jpg, .jpeg и .png',
            ),
            false,
          );
        }
      },
    }),
  )
  uploadImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5_000_000 })],
      }),
    )
    files: Express.Multer.File[],
    @Body() dto: CreateImageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.imagesService.uploadImage(files, dto, userId);
  }

  @Delete('deleteImage/:id')
  @ApiOperation({ summary: 'Удалить изображение по ID' })
  @ApiResponse({ status: 204, description: 'Изображение успешно удалено' })
  @ApiResponse({
    status: 404,
    description: 'Изображение не найдено или не принадлежит пользователю',
  })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.imagesService.remove(id, userId);
  }

  @Post('moveImage/:id')
  @ApiOperation({ summary: 'Переместить изображение в другую галерею' })
  @ApiResponse({
    status: 200,
    description: 'Изображение успешно перемещено',
  })
  moveImage(
    @Param('id') id: string,
    @Body() dto: MoveImageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.imagesService.moveImage(id, dto, userId);
  }

  @Post('copyImage/:id')
  @ApiOperation({ summary: 'Скопировать изображение в другую галерею' })
  @ApiResponse({
    status: 200,
    description: 'Изображение успешно скопировано',
  })
  copyImage(
    @Param('id') id: string,
    @Body() dto: MoveImageDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.imagesService.copyImage(id, dto, userId);
  }

  @Get('gallery/:galleryId')
  @ApiOperation({ summary: 'Получить список изображений конкретной галереи' })
  @ApiResponse({
    status: 200,
    description: 'Список изображений',
  })
  getImagesByGallery(
    @Param('galleryId') galleryId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.imagesService.getImagesByGallery(
      galleryId,
      page,
      limit,
      userId,
    );
  }
}
