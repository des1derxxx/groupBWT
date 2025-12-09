import { IsNotEmpty, IsString } from 'class-validator';

export class CreateImageDto {
  @IsNotEmpty()
  @IsString()
  galleryId: string;
}
