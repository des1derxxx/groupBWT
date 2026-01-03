import { ApiProperty } from '@nestjs/swagger';
import { GalleryRole } from '../enums/gallery-role.enum';

export class GalleryMemberDto {
  @ApiProperty({ example: 'uuid', description: 'Уникальный ID записи' })
  id: string;

  @ApiProperty({
    enum: GalleryRole,
    example: GalleryRole.VIEW_ONLY,
    description: 'Роль пользователя',
  })
  role: GalleryRole;

  @ApiProperty({
    example: '2025-12-01T17:00:00Z',
    description: 'Дата добавления',
  })
  createdAt: Date;

  @ApiProperty({ example: 'uuid', description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ example: 'uuid', description: 'ID галереи' })
  galleryId: string;

  @ApiProperty({
    description: 'Информация о пользователе',
    required: false,
  })
  user?: {
    id: string;
    email: string;
    firstname?: string;
    lastname?: string;
  };
}

