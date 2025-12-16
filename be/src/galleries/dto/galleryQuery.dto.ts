import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GalleryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['createdAt', 'title', 'imagesCount'])
  sortBy?: 'createdAt' | 'title' | 'imagesCount';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  minImages?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  maxImages?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 9;
}
