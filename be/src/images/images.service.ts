import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { promises as fs } from 'fs';
import path from 'path';
import { Images } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadImage(files: Express.Multer.File[], dto: CreateImageDto) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const uploaded: Images[] = [];

    const gallery = await this.prisma.galleries.findUnique({
      where: { id: dto.galleryId },
    });

    if (!gallery) {
      throw new NotFoundException('Галерея не найдена');
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

  async remove(id: string, dto: CreateImageDto) {
    const uploadDir = path.join(process.cwd());

    const image = await this.prisma.images.findUnique({ where: { id: id } });
    if (!image) {
      throw new Error(`Картинка не найдена`);
    }
    const filePath = path.join(uploadDir, image.path);
    await fs.rm(filePath);

    await this.prisma.images.delete({ where: { id: id } });

    return `Delete ${image.originalFilename}`;
  }

  async moveImage(id: string, dto: CreateImageDto) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id: dto.galleryId },
    });
    if (!gallery) {
      throw new NotFoundException('Галерея не найдена');
    }

    const image = await this.prisma.images.findUnique({ where: { id: id } });
    if (!image) {
      throw new NotFoundException(`Картинка не найдена`);
    }

    if (image.galleryId === dto.galleryId) {
      throw new BadRequestException('Картинка уже в этой галерее');
    }

    const updatedImage = await this.prisma.images.update({
      where: { id: id },
      data: {
        galleryId: dto.galleryId,
      },
    });

    return {
      message: `Картинка перенесена в ${gallery.title}`,
      image: updatedImage,
    };
  }

  async copyImage(id: string, dto: CreateImageDto) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id: dto.galleryId },
    });
    if (!gallery) {
      throw new NotFoundException(`Галерея не найдена`);
    }

    const image = await this.prisma.images.findUnique({ where: { id: id } });
    if (!image) {
      throw new NotFoundException(`Картинка не найдена`);
    }

    if (image.galleryId === dto.galleryId) {
      throw new BadRequestException('Нельзя скопировать в эту галерею');
    }

    const imageToNewGallery = await this.prisma.images.create({
      data: {
        path: image.path,
        originalFilename: image.originalFilename,
        gallery: { connect: { id: gallery.id } },
      },
    });

    return {
      message: `Картинка скорирована в ${gallery.title}`,
      image: imageToNewGallery,
    };
  }

  async getImagesByGallery(
    galleryId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id: galleryId },
    });

    if (!gallery) {
      throw new NotFoundException('Галерея не найдена');
    }

    const skip = (page - 1) * limit;
    const images = await this.prisma.images.findMany({
      where: { galleryId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prisma.images.count({
      where: { galleryId },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      galleryId,
      page,
      limit,
      total,
      totalPages,
      images,
    };
  }
}
