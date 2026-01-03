import { IsString, MinLength, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  content: string;
}
