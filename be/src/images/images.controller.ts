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
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { promises as fs } from 'fs';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5_000_000_000 })],
      }),
    )
    files: Express.Multer.File[],
    @Body() dto: CreateImageDto,
  ) {
    console.log(files);
    return this.imagesService.uploadImage(files, dto);
  }
  @Delete('deleteImage/:id')
  remove(@Param('id') id: string, dto: CreateImageDto) {
    return this.imagesService.remove(id, dto);
  }

  @Post('moveImage/:id')
  moveImage(@Param('id') id: string, @Body() dto: CreateImageDto) {
    return this.imagesService.moveImage(id, dto);
  }

  @Post('copyImage/:id')
  copyImage(@Param('id') id: string, @Body() dto: CreateImageDto) {
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
