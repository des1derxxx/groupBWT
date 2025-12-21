import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';
import { promises as fs } from 'fs';
import path from 'path';
import { ImagesService } from 'src/images/images.service';
import { GalleryQueryDto } from './dto/galleryQuery.dto';
import { Prisma } from '@prisma/client';

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
      page,
      limit,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      from,
      to,
      minImages,
      maxImages,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.GalleriesWhereInput = {
      userId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (from || to) {
      where.createdAt = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    if (minImages !== undefined || maxImages !== undefined) {
      where.imagesCount = {
        ...(minImages !== undefined && { gte: minImages }),
        ...(maxImages !== undefined && { lte: maxImages }),
      };
    }
    let orderBy: Prisma.GalleriesOrderByWithRelationInput;

    if (sortBy === 'imagesCount') {
      orderBy = {
        imagesCount: order,
      };
    } else {
      orderBy = {
        [sortBy]: order,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.galleries.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.galleries.count({ where }),
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
