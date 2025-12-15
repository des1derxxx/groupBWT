import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  galleryId: string;
}
