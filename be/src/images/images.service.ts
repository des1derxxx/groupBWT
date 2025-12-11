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

  private async getGallery(id: string) {
    const gallery = await this.prisma.galleries.findUnique({ where: { id } });
    if (!gallery) throw new NotFoundException('Галерея не найдена');
    return gallery;
  }

  private async getImage(id: string) {
    const image = await this.prisma.images.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Картинка не найдена');
    return image;
  }

  private async saveFile(file: Express.Multer.File, uploadDir: string) {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return { fileName, filePath };
  }

  async uploadImage(files: Express.Multer.File[], dto: CreateImageDto) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log(error);
    }

    const uploaded: Images[] = [];

    const gallery = await this.getGallery(dto.galleryId);

    for (const file of files) {
      try {
        const { fileName } = await this.saveFile(file, uploadDir);

        const image = await this.prisma.images.create({
          data: {
            path: `/uploads/${fileName}`,
            originalFilename: file.originalname,
            gallery: { connect: { id: gallery.id } },
          },
        });

        uploaded.push(image);
      } catch (err) {
        console.log('Ошибка при загрузке файла:', err);
      }
    }

    return { message: 'uploaded', count: uploaded.length, images: uploaded };
  }

  async remove(id: string) {
    const uploadDir = path.join(process.cwd());

    const image = await this.getImage(id);

    const filePath = path.join(process.cwd(), image.path.replace(/^\//, ''));
    try {
      await fs.rm(filePath, { force: true });
    } catch (error) {
      console.log(error);
    }

    await this.prisma.images.delete({ where: { id: id } });

    return `Delete ${image.originalFilename}`;
  }

  async moveImage(id: string, dto: MoveImageDto) {
    const gallery = await this.getGallery(dto.galleryId);

    const image = await this.getImage(id);

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

  async copyImage(id: string, dto: MoveImageDto) {
    const gallery = await this.getGallery(dto.galleryId);

    const image = await this.getImage(id);

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
    const gallery = await this.getGallery(galleryId);

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
