import { ApiProperty } from '@nestjs/swagger';

export class BaseGallery {
  @ApiProperty({ example: 'uuid', description: 'Уникальный ID галереи' })
  id: string;

  @ApiProperty({ example: 'Моя галерея', description: 'Название галереи' })
  title: string;

  @ApiProperty({
    example: 'Описание галереи',
    description: 'Описание',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '2025-12-01T17:00:00Z',
    description: 'Дата создания',
  })
  createdAt: Date;
}
