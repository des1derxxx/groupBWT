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

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Можно загружать только изображения'),
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
  ) {
    return this.imagesService.uploadImage(files, dto);
  }

  @Delete('deleteImage/:id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }

  @Post('moveImage/:id')
  moveImage(@Param('id') id: string, @Body() dto: MoveImageDto) {
    return this.imagesService.moveImage(id, dto);
  }

  @Post('copyImage/:id')
  copyImage(@Param('id') id: string, @Body() dto: MoveImageDto) {
    return this.imagesService.copyImage(id, dto);
  }

  @Get('gallery/:galleryId')
  getImagesByGallery(
    @Param('galleryId') galleryId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.imagesService.getImagesByGallery(galleryId, page, limit);
  }
}
