import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';
import { promises as fs } from 'fs';
import path from 'path';

@Injectable()
export class GalleriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGalleryDto, userId: string) {
    const gallery = await this.prisma.galleries.create({
      data: {
        title: dto.title,
        description: dto.description,
        user: { connect: { id: userId } },
      },
    });
    return gallery;
  }

  async findAll() {
    const galleries = await this.prisma.galleries.findMany({
      include: {
        user: true,
      },
    });

    return galleries;
  }

  async getAllUsersGallery(
    userId: string,
    page: number = 1,
    limit: number = 9,
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.galleries.findMany({
        where: { userId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.galleries.count({
        where: { userId: userId },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id },
      include: { user: true },
    });
    return gallery;
  }

  async update(id: string, dto: UpdateGalleryDto) {
    const gallery = await this.prisma.galleries.update({
      where: { id },
      data: dto,
    });
    return gallery;
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Нет айди');
    }
    const images = await this.prisma.images.findMany({
      where: { galleryId: id },
    });

    for (const img of images) {
      if (!img.path) continue;
      const fullPath = path.join(process.cwd(), img.path);
      try {
        await fs.unlink(fullPath);
      } catch (err) {
        console.warn(`Ошибка удаления файла: ${fullPath}`, err);
      }
    }
    await this.prisma.images.deleteMany({
      where: { galleryId: id },
    });
    await this.prisma.galleries.delete({
      where: { id },
    });

    return { message: 'Галерея и все картинки удалены' };
  }
}
