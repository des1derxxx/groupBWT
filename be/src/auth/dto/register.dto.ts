import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty()
    @IsString()
    firstname: string;
  
    @ApiProperty()
    @IsString()
    lastname: string;
  
    @ApiProperty()
    @IsEmail()
    email: string;
  
    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string;
}

