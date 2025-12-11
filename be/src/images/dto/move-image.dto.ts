import { IsNotEmpty, IsString } from 'class-validator';

export class MoveImageDto {
  @IsString()
  @IsNotEmpty()
  galleryId: string;
}
