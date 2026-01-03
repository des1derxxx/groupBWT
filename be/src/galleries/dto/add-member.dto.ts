import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { GalleryRole } from '../enums/gallery-role.enum';

export class AddMemberDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя для добавления в галерею',
  })
  @IsString()
  email: string;

  @ApiProperty({
    enum: GalleryRole,
    example: GalleryRole.VIEW_ONLY,
    description: 'Роль пользователя в галереи',
  })
  @IsEnum(GalleryRole)
  role: GalleryRole;
}

