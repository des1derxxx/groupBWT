import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { promises as fs } from 'fs';
import path from 'path';
import { Images } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MoveImageDto } from './dto/move-image.dto';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  private async getUserGallery(galleryId: string, userId: string) {
    const gallery = await this.prisma.galleries.findFirst({
      where: {
        id: galleryId,
        userId: userId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(
        'Галерея не найдена или не принадлежит пользователю',
      );
    }

    return gallery;
  }

  private async getUserImage(imageId: string, userId: string) {
    const image = await this.prisma.images.findFirst({
      where: {
        id: imageId,
        gallery: {
          userId: userId,
        },
      },
    });

    if (!image) {
      throw new NotFoundException(
        'Картинка не найдена или не принадлежит пользователю',
      );
    }

    return image;
  }

  private async getUserImagesByGallery(galleryId: string, userId: string) {
    const images = await this.prisma.images.findMany({
      where: {
        galleryId,
        gallery: { userId },
      },
    });

    return images;
  }

  private async saveFile(file: Express.Multer.File, uploadDir: string) {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return { fileName, filePath };
  }

  async uploadImage(
    files: Express.Multer.File[],
    dto: CreateImageDto,
    userId: string,
  ) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const savedFilePaths: string[] = [];
    const uploaded: Images[] = [];
    const gallery = await this.getUserGallery(dto.galleryId, userId);

    try {
      const savedFiles = await Promise.all(
        files.map((file) => this.saveFile(file, uploadDir)),
      );
      savedFiles.forEach((f) => savedFilePaths.push(f.filePath));
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < files.length; i++) {
          const { fileName } = savedFiles[i];
          const file = files[i];

          const image = await tx.images.create({
            data: {
              path: `/uploads/${fileName}`,
              originalFilename: file.originalname,
              gallery: { connect: { id: gallery.id } },
            },
          });

          uploaded.push(image);
        }

        await tx.galleries.update({
          where: { id: gallery.id },
          data: {
            imagesCount: {
              increment: uploaded.length,
            },
          },
        });
      });

      return { message: 'uploaded', count: uploaded.length, images: uploaded };
    } catch (err) {
      console.error('Ошибка:', err);

      await Promise.all(
        savedFilePaths.map(async (path) => {
          try {
            await fs.unlink(path);
          } catch {}
        }),
      );

      throw new BadRequestException('Ошибка');
    }
  }

  async remove(id: string, userId) {
    const image = await this.getUserImage(id, userId);

    const filePath = path.join(process.cwd(), image.path.replace(/^\//, ''));
    try {
      await fs.rm(filePath, { force: true });
    } catch (error) {
      console.log(error);
    }

    await this.prisma.galleries.updateMany({
      where: { id: image.galleryId, imagesCount: { gt: 0 } },
      data: {
        imagesCount: { decrement: 1 },
      },
    });

    await this.prisma.images.delete({ where: { id: id } });

    return `Delete ${image.originalFilename}`;
  }

  async removeByGallery(galleryId: string, userId: string) {
    const images = await this.getUserImagesByGallery(galleryId, userId);
    for (const img of images) {
      if (!img.path) continue;
      const filePath = path.join(process.cwd(), img.path.replace(/^\//, ''));
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`Ошибка удаления: ${filePath}`, err);
      }
    }
    await this.prisma.images.deleteMany({
      where: {
        galleryId,
        gallery: { userId },
      },
    });

    return images.length;
  }

  async moveImage(id: string, dto: MoveImageDto, userId) {
    const gallery = await this.getUserGallery(dto.galleryId, userId);

    const image = await this.getUserImage(id, userId);

    if (image.galleryId === dto.galleryId) {
      throw new BadRequestException('Картинка уже в этой галерее');
    }

    const updatedImage = await this.prisma.images.update({
      where: { id: id },
      data: {
        galleryId: dto.galleryId,
      },
    });

    await this.prisma.galleries.updateMany({
      where: { id: image.galleryId, imagesCount: { gt: 0 } },
      data: {
        imagesCount: { decrement: 1 },
      },
    });

    await this.prisma.galleries.update({
      where: { id: dto.galleryId },
      data: {
        imagesCount: { increment: 1 },
      },
    });

    return {
      message: `Картинка перенесена в ${gallery.title}`,
      image: updatedImage,
    };
  }

  async copyImage(id: string, dto: MoveImageDto, userId) {
    const gallery = await this.getUserGallery(dto.galleryId, userId);

    const image = await this.getUserImage(id, userId);

    if (image.galleryId === dto.galleryId) {
      throw new BadRequestException('Нельзя скопировать в эту галерею');
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    const oldPath = path.join(process.cwd(), image.path.replace(/^\//, ''));

    const fileExt = path.extname(image.originalFilename);
    const newFileName = `${Date.now()}-${randomUUID()}${fileExt}`;
    const newFilePath = path.join(uploadDir, newFileName);

    await fs.copyFile(oldPath, newFilePath);

    const imageToNewGallery = await this.prisma.images.create({
      data: {
        path: `/uploads/${newFileName}`,
        originalFilename: image.originalFilename,
        gallery: { connect: { id: gallery.id } },
      },
    });

    await this.prisma.galleries.update({
      where: { id: dto.galleryId },
      data: {
        imagesCount: { increment: 1 },
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
    limit: number = 9,
    userId,
  ) {
    await this.getUserGallery(galleryId, userId);

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
