import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';
import { promises as fs } from 'fs';
import path from 'path';
import { ImagesService } from 'src/images/images.service';
import { GalleryQueryDto } from './dto/galleryQuery.dto';
import { Prisma } from '@prisma/client';
import { GalleryRole } from './enums/gallery-role.enum';
import Fuse from 'fuse.js';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GalleriesService {
  constructor(
    private prisma: PrismaService,
    private imagesService: ImagesService,
    private usersService: UsersService,
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

    const where: Prisma.GalleriesWhereInput = {
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    };
    if (from || to) {
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = new Date(from);
      }

      if (to) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }
    if (minImages !== undefined || maxImages !== undefined) {
      where.imagesCount = {};

      if (minImages !== undefined) {
        where.imagesCount.gte = minImages;
      }

      if (maxImages !== undefined) {
        where.imagesCount.lte = maxImages;
      }
    }
    const items = await this.prisma.galleries.findMany({
      where,
      include: {
        user: true,
        members: true,
      },
      orderBy: {
        [sortBy]: order,
      },
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

  async update(id: string, dto: UpdateGalleryDto, userId: string) {
    await this.checkGalleryAccess(id, userId, true);
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
    await this.checkGalleryAccess(id, userId, true);
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
  private async checkGalleryAccess(
    galleryId: string,
    userId: string,
    requireFullAccess: boolean = false,
  ) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id: galleryId },
      include: { members: true },
    });
    if (!gallery) {
      throw new NotFoundException('Галерея не найдена');
    }
    if (gallery.userId === userId) {
      return;
    }
    const member = gallery.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('Нет доступа к этой галерее');
    }

    if (requireFullAccess && member.role !== GalleryRole.FULL_ACCESS) {
      throw new ForbiddenException(
        'Недостаточно прав для выполнения этой операции',
      );
    }
  }
  async hasGalleryAccess(
    galleryId: string,
    userId: string,
    requireFullAccess: boolean = false,
  ): Promise<boolean> {
    try {
      await this.checkGalleryAccess(galleryId, userId, requireFullAccess);
      return true;
    } catch {
      return false;
    }
  }
  async addMember(galleryId: string, userId: string, dto: AddMemberDto) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id: galleryId },
    });

    if (!gallery) {
      throw new NotFoundException('Галерея не найдена');
    }

    if (gallery.userId !== userId) {
      throw new ForbiddenException(
        'Только владелец галереи может добавлять участников',
      );
    }
    const userToAdd = await this.usersService.findOneBy(dto.email);
    if (!userToAdd) {
      throw new NotFoundException('Пользователь с таким email не найден');
    }
    if (userToAdd.id === userId) {
      throw new BadRequestException('Нельзя добавить владельца галереи');
    }
    const existingMember = await this.prisma.galleryMember.findUnique({
      where: {
        userId_galleryId: {
          userId: userToAdd.id,
          galleryId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'Пользователь уже является участником этой галереи',
      );
    }
    const member = await this.prisma.galleryMember.create({
      data: {
        userId: userToAdd.id,
        galleryId,
        role: dto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    return member;
  }

  async removeMember(galleryId: string, userId: string, memberId: string) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id: galleryId },
    });

    if (!gallery) {
      throw new NotFoundException('Галерея не найдена');
    }

    if (gallery.userId !== userId) {
      throw new ForbiddenException(
        'Только владелец галереи может удалять участников',
      );
    }
    await this.prisma.galleryMember.delete({
      where: { id: memberId },
    });
    return { message: 'Участник успешно удален из галереи' };
  }
  async updateMemberRole(
    galleryId: string,
    userId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ) {
    const gallery = await this.prisma.galleries.findUnique({
      where: { id: galleryId },
    });
    if (!gallery) {
      throw new NotFoundException('Галерея не найдена');
    }
    if (gallery.userId !== userId) {
      throw new ForbiddenException(
        'Только владелец галереи может изменять роли участников',
      );
    }
    const member = await this.prisma.galleryMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    return member;
  }

  async getGalleryMembers(galleryId: string, userId: string) {
    await this.checkGalleryAccess(galleryId, userId);

    const members = await this.prisma.galleryMember.findMany({
      where: { galleryId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return members;
  }
}
