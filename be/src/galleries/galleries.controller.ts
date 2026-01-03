import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { GalleriesService } from './galleries.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BaseGallery } from './dto/gallery.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { GalleryQueryDto } from './dto/galleryQuery.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { GalleryMemberDto } from './dto/member.dto';

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
  create(@Body() dto: CreateGalleryDto, @CurrentUser('sub') userId: string) {
    return this.galleriesService.create(dto, userId);
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

  @Get('/userGallery')
  @ApiOperation({ summary: 'Получить список всех галерей конкретного юзера' })
  getAllUsersGallery(
    @CurrentUser('sub') userId: string,
    @Query() query: GalleryQueryDto,
  ) {
    return this.galleriesService.getAllUsersGallery(userId, query);
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
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.galleriesService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить галерею по ID' })
  @ApiResponse({ status: 204, description: 'Галерея успешно удалена' })
  @ApiResponse({ status: 404, description: 'Галерея не найдена' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.galleriesService.remove(id, userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Добавить участника в галерею' })
  @ApiResponse({
    status: 201,
    description: 'Участник успешно добавлен',
    type: GalleryMemberDto,
  })
  @ApiResponse({ status: 404, description: 'Галерея или пользователь не найдены' })
  @ApiResponse({ status: 403, description: 'Только владелец может добавлять участников' })
  @ApiResponse({ status: 400, description: 'Пользователь уже является участником' })
  addMember(
    @Param('id') galleryId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.galleriesService.addMember(galleryId, userId, dto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Получить список участников галереи' })
  @ApiResponse({
    status: 200,
    description: 'Список участников успешно получен',
    type: [GalleryMemberDto],
  })
  @ApiResponse({ status: 404, description: 'Галерея не найдена' })
  @ApiResponse({ status: 403, description: 'Нет доступа к галерее' })
  getMembers(
    @Param('id') galleryId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.galleriesService.getGalleryMembers(galleryId, userId);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Изменить роль участника галереи' })
  @ApiResponse({
    status: 200,
    description: 'Роль участника успешно изменена',
    type: GalleryMemberDto,
  })
  @ApiResponse({ status: 404, description: 'Галерея или участник не найдены' })
  @ApiResponse({ status: 403, description: 'Только владелец может изменять роли' })
  updateMemberRole(
    @Param('id') galleryId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.galleriesService.updateMemberRole(
      galleryId,
      userId,
      memberId,
      dto,
    );
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Удалить участника из галереи' })
  @ApiResponse({
    status: 200,
    description: 'Участник успешно удален из галереи',
  })
  @ApiResponse({ status: 404, description: 'Галерея или участник не найдены' })
  @ApiResponse({ status: 403, description: 'Только владелец может удалять участников' })
  removeMember(
    @Param('id') galleryId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.galleriesService.removeMember(galleryId, userId, memberId);
  }
}
