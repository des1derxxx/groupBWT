import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  firstname?: string;

  @IsOptional()
  @ApiProperty()
  lastname?: string;

  @IsOptional()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @ApiProperty()
  password?: string;
}
