import { ApiProperty } from '@nestjs/swagger';
export class BaseUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstname?: string;

  @ApiProperty()
  lastname?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  createdAt: Date;
}
