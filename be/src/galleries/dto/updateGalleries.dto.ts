import { PartialType } from '@nestjs/swagger';
import { CreateGalleryDto } from './createGalleries.dto';

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {}