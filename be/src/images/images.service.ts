import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { promises as fs } from 'fs';
import path from 'path';
import { Images } from '@prisma/client';
import { connect } from 'http2';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadImage(files: Express.Multer.File[], dto: CreateImageDto) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const uploaded: Images[] = [];

    const gallery = await this.prisma.galleries.findUnique({
      where: { id: '9b5de647-5425-46f6-b551-17e0cc0db2e5' },
    });

    if (!gallery) {
      throw new Error(`Галерея не найдена`);
    }

    for (const file of files) {
      const timestamp = Date.now();
      const fileExt = path.extname(file.originalname);
      const fileName = `${timestamp}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, file.buffer);
      const image = await this.prisma.images.create({
        data: {
          path: `/uploads/${fileName}`,
          originalFilename: file.originalname,
          gallery: { connect: { id: gallery.id } },
        },
      });

      uploaded.push(image);
    }

    return { message: 'uploaded', count: uploaded.length, images: uploaded };
  }

  findAll() {
    return `This action returns all images`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}
