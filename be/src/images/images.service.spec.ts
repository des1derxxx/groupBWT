import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';

describe('ImagesService', () => {
  let service: ImagesService;
  let prisma: PrismaService;

  const mockUserId = 'user-1';
  const mockGalleryId = 'gallery-1';
  const mockImageId = 'image-1';

  const mockGallery = {
    id: mockGalleryId,
    title: 'Gallery 1',
    userId: mockUserId,
    imagesCount: 1,
  };

  const mockImage = {
    id: mockImageId,
    path: '/uploads/image.jpg',
    originalFilename: 'image.jpg',
    galleryId: mockGalleryId,
  };

  const prismaMock = {
    galleries: {
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    images: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });
  it('ошибка если галерея не найдена', async () => {
    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      (service as any).getUserGallery('invalid', mockUserId),
    ).rejects.toThrow(NotFoundException);
  });

  it('ошибка если картинка не найдена', async () => {
    (prisma.images.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      (service as any).getUserImage('invalid', mockUserId),
    ).rejects.toThrow(NotFoundException);
  });

  it('сохраняет файлы и обновляет галерею', async () => {
    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from(''),
    } as Express.Multer.File;

    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(mockGallery);
    (prisma.images.create as jest.Mock).mockResolvedValue({
      id: 'img-1',
      originalFilename: file.originalname,
      path: '',
    });
    (prisma.images.update as jest.Mock).mockResolvedValue({
      id: 'img-1',
      path: '/uploads/img-1.jpg',
    });
    (prisma.galleries.update as jest.Mock).mockResolvedValue({
      ...mockGallery,
      imagesCount: 2,
    });
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) =>
      cb(prismaMock),
    );
    (fs.writeFile as any) = jest.fn().mockResolvedValue(undefined);

    const result = await service.uploadImage(
      [file],
      { galleryId: mockGalleryId },
      mockUserId,
    );

    expect(result.count).toBe(1);
    expect(result.images[0].path).toContain('/uploads/');
  });

  it('ошибка если fs.writeFile падает', async () => {
    const file = {
      originalname: 'fail.jpg',
      buffer: Buffer.from(''),
    } as Express.Multer.File;

    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(mockGallery);
    (prisma.images.create as jest.Mock).mockResolvedValue({
      id: 'img-1',
      originalFilename: file.originalname,
      path: '',
    });
    (fs.writeFile as any) = jest
      .fn()
      .mockRejectedValue(new Error('write fail'));
    (prisma.$transaction as jest.Mock).mockImplementation(async () => {
      throw new Error('FS fail');
    });

    await expect(
      service.uploadImage([file], { galleryId: mockGalleryId }, mockUserId),
    ).rejects.toThrow(BadRequestException);
  });
  it('удаляет файл и запись', async () => {
    (fs.rm as any) = jest.fn().mockResolvedValue(undefined);
    (prisma.images.findFirst as jest.Mock).mockResolvedValue(mockImage);
    (prisma.galleries.updateMany as jest.Mock).mockResolvedValue(null);
    (prisma.images.delete as jest.Mock).mockResolvedValue(mockImage);

    const result = await service.remove(mockImageId, mockUserId);

    expect(result).toContain('Delete');
    expect(fs.rm).toHaveBeenCalled();
  });

  it('игнорирует ошибки fs.rm', async () => {
    (fs.rm as any) = jest.fn().mockRejectedValue(new Error('rm fail'));
    (prisma.images.findFirst as jest.Mock).mockResolvedValue(mockImage);
    (prisma.galleries.updateMany as jest.Mock).mockResolvedValue(null);
    (prisma.images.delete as jest.Mock).mockResolvedValue(mockImage);

    const result = await service.remove(mockImageId, mockUserId);
    expect(result).toContain('Delete');
  });
  it('удаляет все картинки галереи', async () => {
    const images = [
      mockImage,
      { ...mockImage, id: 'img-2', path: '/uploads/img2.jpg' },
    ];
    (fs.unlink as any) = jest.fn().mockResolvedValue(undefined);
    (prisma.images.findMany as jest.Mock).mockResolvedValue(images);
    (prisma.images.deleteMany as jest.Mock).mockResolvedValue(null);

    const count = await service.removeByGallery(mockGalleryId, mockUserId);
    expect(count).toBe(images.length);
    expect(fs.unlink).toHaveBeenCalledTimes(images.length);
  });

  it('игнорирует ошибки fs.unlink', async () => {
    const images = [
      mockImage,
      { ...mockImage, id: 'img-2', path: '/uploads/img2.jpg' },
    ];
    (fs.unlink as any) = jest.fn().mockRejectedValue(new Error('unlink fail'));
    (prisma.images.findMany as jest.Mock).mockResolvedValue(images);
    (prisma.images.deleteMany as jest.Mock).mockResolvedValue(null);

    const count = await service.removeByGallery(mockGalleryId, mockUserId);
    expect(count).toBe(images.length);
  });
  it('переносит картинку в другую галерею', async () => {
    const newGallery = {
      id: 'gallery-2',
      title: 'New Gallery',
      userId: mockUserId,
    };
    (prisma.galleries.findFirst as jest.Mock).mockResolvedValueOnce(newGallery);
    (prisma.images.findFirst as jest.Mock).mockResolvedValueOnce(mockImage);
    (prisma.images.update as jest.Mock).mockResolvedValue({
      ...mockImage,
      galleryId: 'gallery-2',
    });
    (prisma.galleries.updateMany as jest.Mock).mockResolvedValue(null);
    (prisma.galleries.update as jest.Mock).mockResolvedValue({
      ...newGallery,
      imagesCount: 1,
    });

    const result = await service.moveImage(
      mockImageId,
      { galleryId: 'gallery-2' },
      mockUserId,
    );
    expect(result.message).toContain('Картинка перенесена');
    expect(result.image.galleryId).toBe('gallery-2');
  });

  it('ошибка если картинка уже в этой галерее', async () => {
    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(mockGallery);
    (prisma.images.findFirst as jest.Mock).mockResolvedValue(mockImage);

    await expect(
      service.moveImage(mockImageId, { galleryId: mockGalleryId }, mockUserId),
    ).rejects.toThrow(BadRequestException);
  });
  it('копирует картинку в другую галерею', async () => {
    const newGallery = {
      id: 'gallery-2',
      title: 'New Gallery',
      userId: mockUserId,
    };
    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(newGallery);
    (prisma.images.findFirst as jest.Mock).mockResolvedValue(mockImage);
    (fs.copyFile as any) = jest.fn().mockResolvedValue(undefined);
    (prisma.images.create as jest.Mock).mockResolvedValue({
      ...mockImage,
      id: 'img-2',
    });
    (prisma.galleries.update as jest.Mock).mockResolvedValue({
      ...newGallery,
      imagesCount: 2,
    });

    const result = await service.copyImage(
      mockImageId,
      { galleryId: 'gallery-2' },
      mockUserId,
    );
    expect(result.message).toContain('скорирована');
    expect(result.image.id).toBe('img-2');
  });

  it('ошибку если картинка уже в этой галерее', async () => {
    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(mockGallery);
    (prisma.images.findFirst as jest.Mock).mockResolvedValue(mockImage);

    await expect(
      service.copyImage(mockImageId, { galleryId: mockGalleryId }, mockUserId),
    ).rejects.toThrow(BadRequestException);
  });

  it('ошибку если fs.copyFile падает', async () => {
    const newGallery = {
      id: 'gallery-2',
      title: 'New Gallery',
      userId: mockUserId,
    };
    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(newGallery);
    (prisma.images.findFirst as jest.Mock).mockResolvedValue(mockImage);
    (fs.copyFile as any) = jest.fn().mockRejectedValue(new Error('copy fail'));

    await expect(
      service.copyImage(mockImageId, { galleryId: 'gallery-2' }, mockUserId),
    ).rejects.toThrow();
  });
  it('картинки с пагинацией', async () => {
    (prisma.galleries.findFirst as jest.Mock).mockResolvedValue(mockGallery);
    (prisma.images.findMany as jest.Mock).mockResolvedValue([mockImage]);
    (prisma.images.count as jest.Mock).mockResolvedValue(1);

    const result = await service.getImagesByGallery(
      mockGalleryId,
      1,
      10,
      mockUserId,
    );
    expect(result.images.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });
});
