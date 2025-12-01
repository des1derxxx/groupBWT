import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GalleriesService } from './galleries.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BaseGallery } from './dto/gallery.dto';

@ApiTags('galleries')
@Controller('galleries')
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую галерею' })
  @ApiResponse({
    status: 201,
    description: 'Галерея успешно создана',
    type: BaseGallery,
  })
  create(@Body() dto: CreateGalleryDto) {
    return this.galleriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех галерей' })
  @ApiResponse({
    status: 200,
    description: 'Список галерей успешно получен',
    type: [BaseGallery],
  })
  findAll() {
    return this.galleriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить галерею по ID' })
  @ApiResponse({
    status: 200,
    description: 'Галерея найдена',
    type: BaseGallery,
  })
  @ApiResponse({ status: 404, description: 'Галерея не найдена' })
  findOne(@Param('id') id: string) {
    return this.galleriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить данные галереи' })
  @ApiResponse({
    status: 200,
    description: 'Галерея успешно обновлена',
    type: BaseGallery,
  })
  @ApiResponse({ status: 404, description: 'Галерея не найдена' })
  update(@Param('id') id: string, @Body() dto: UpdateGalleryDto) {
    return this.galleriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить галерею по ID' })
  @ApiResponse({ status: 204, description: 'Галерея успешно удалена' })
  @ApiResponse({ status: 404, description: 'Галерея не найдена' })
  remove(@Param('id') id: string) {
    return this.galleriesService.remove(id);
  }
}
