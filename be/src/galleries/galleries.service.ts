import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';
import { promises as fs } from 'fs';
import path from 'path';
import { ImagesService } from 'src/images/images.service';
import { GalleryQueryDto } from './dto/galleryQuery.dto';
import { Prisma } from '@prisma/client';
import Fuse from 'fuse.js';

@Injectable()
export class GalleriesService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
  ) {}

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

  async getAllUsersGallery(userId: string, query: GalleryQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      from,
      to,
      minImages,
      maxImages,
    } = query;

    const items = await this.prisma.galleries.findMany({
      where: {
        userId,
        ...(from && { createdAt: { gte: new Date(from) } }),
        ...(to && { createdAt: { lte: new Date(to) } }),
        ...(minImages !== undefined && { imagesCount: { gte: minImages } }),
        ...(maxImages !== undefined && { imagesCount: { lte: maxImages } }),
      },
      orderBy: { [sortBy]: order },
    });

    let filtered = items;
    if (search) {
      const fuse = new Fuse(items, {
        keys: ['title', 'description'],
        threshold: 0.4,
      });
      filtered = fuse.search(search).map((r) => r.item);
    }

    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      items: paged,
      total: filtered.length,
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

  async remove(id: string, userId: string) {
    if (!id) {
      throw new BadRequestException('Нет айди');
    }
    const deletedImagesCount = await this.imagesService.removeByGallery(
      id,
      userId,
    );
    await this.prisma.galleries.delete({
      where: { id },
    });
    return {
      message: `Галерея удалена, и ${deletedImagesCount} картинок`,
    };
  }
}
