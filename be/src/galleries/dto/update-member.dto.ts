import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { GalleryRole } from '../enums/gallery-role.enum';

export class UpdateMemberDto {
  @ApiProperty({
    enum: GalleryRole,
    example: GalleryRole.FULL_ACCESS,
    description: 'Новая роль пользователя в галереи',
  })
  @IsEnum(GalleryRole)
  role: GalleryRole;
}

