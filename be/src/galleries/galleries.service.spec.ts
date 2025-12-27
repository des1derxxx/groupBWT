import { Test, TestingModule } from '@nestjs/testing';
import { GalleriesService } from './galleries.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesService } from 'src/images/images.service';
import { BadRequestException } from '@nestjs/common';
import { GalleryQueryDto } from './dto/galleryQuery.dto';

describe('GalleriesService', () => {
  let service: GalleriesService;
  let prisma: PrismaService;
  let imagesService: ImagesService;

  const mockUserId = 'user-1';
  const mockGalleryId = 'gallery-1';

  const mockGallery = {
    id: mockGalleryId,
    title: 'Test gallery',
    description: 'Description',
    userId: mockUserId,
    imagesCount: 2,
    createdAt: new Date(),
  };

  const prismaMock = {
    galleries: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const imagesServiceMock = {
    removeByGallery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleriesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ImagesService,
          useValue: imagesServiceMock,
        },
      ],
    }).compile();

    service = module.get<GalleriesService>(GalleriesService);
    prisma = module.get<PrismaService>(PrismaService);
    imagesService = module.get<ImagesService>(ImagesService);

    jest.clearAllMocks();
  });
  it('создание галереи', async () => {
    jest
      .spyOn(prisma.galleries, 'create')
      .mockResolvedValue(mockGallery as any);

    const result = await service.create(
      { title: 'Test gallery', description: 'Description' },
      mockUserId,
    );

    expect(prisma.galleries.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Test gallery',
          description: 'Description',
          user: { connect: { id: mockUserId } },
        }),
      }),
    );

    expect(result).toEqual(mockGallery);
  });
  it('возвращает все галереи', async () => {
    jest
      .spyOn(prisma.galleries, 'findMany')
      .mockResolvedValue([mockGallery] as any);

    const result = await service.findAll();

    expect(result).toEqual([mockGallery]);
  });
  it('возвращает галерею по ID', async () => {
    jest
      .spyOn(prisma.galleries, 'findUnique')
      .mockResolvedValue(mockGallery as any);

    const result = await service.findOne(mockGalleryId);

    expect(prisma.galleries.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockGalleryId },
        include: { user: true },
      }),
    );
    expect(result).toEqual(mockGallery);
  });
  it('обновляет галерею', async () => {
    jest
      .spyOn(prisma.galleries, 'update')
      .mockResolvedValue({ ...mockGallery, title: 'Updated' } as any);

    const result = await service.update(mockGalleryId, { title: 'Updated' });

    expect(prisma.galleries.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockGalleryId },
        data: { title: 'Updated' },
      }),
    );
    expect(result.title).toBe('Updated');
  });
  it('выбрасывает ошибку при пустом ID', async () => {
    await expect(service.remove('', mockUserId)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('удаляет галерею и вызывает удаление изображений', async () => {
    jest.spyOn(imagesService, 'removeByGallery').mockResolvedValue(2);
    jest
      .spyOn(prisma.galleries, 'delete')
      .mockResolvedValue(mockGallery as any);

    const result = await service.remove(mockGalleryId, mockUserId);

    expect(imagesService.removeByGallery).toHaveBeenCalledWith(
      mockGalleryId,
      mockUserId,
    );
    expect(prisma.galleries.delete).toHaveBeenCalledWith({
      where: { id: mockGalleryId },
    });
    expect(result.message).toContain('2');
  });

  it('возвращает галереи пользователя с пагинацией', async () => {
    jest
      .spyOn(prisma.galleries, 'findMany')
      .mockResolvedValue([
        mockGallery,
        { ...mockGallery, id: '2' },
        { ...mockGallery, id: '3' },
      ] as any);

    const query: GalleryQueryDto = { page: 2, limit: 1 };

    const result = await service.getAllUsersGallery(mockUserId, query);

    expect(result.items.length).toBe(1);
    expect(result.page).toBe(2);
    expect(result.total).toBe(3);
  });

  it('фильтрует галереи по search', async () => {
    jest
      .spyOn(prisma.galleries, 'findMany')
      .mockResolvedValue([
        mockGallery,
        { ...mockGallery, id: '2', title: 'Other gallery' },
      ] as any);

    const result = await service.getAllUsersGallery(mockUserId, {
      page: 1,
      limit: 10,
      search: 'Test',
    });

    expect(result.items.length).toBe(1);
    expect(result.items[0].title).toBe('Test gallery');
  });

  it('сортирует галереи по createdAt asc', async () => {
    jest
      .spyOn(prisma.galleries, 'findMany')
      .mockResolvedValue([mockGallery] as any);

    await service.getAllUsersGallery(mockUserId, {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      order: 'asc',
    });

    expect(prisma.galleries.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
    );
  });

  it('фильтрует галереи по from дате', async () => {
    jest
      .spyOn(prisma.galleries, 'findMany')
      .mockResolvedValue([mockGallery] as any);

    await service.getAllUsersGallery(mockUserId, {
      page: 1,
      limit: 10,
      from: '2024-01-01',
    });

    expect(prisma.galleries.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      }),
    );
  });

  it('фильтрует галереи по to дате', async () => {
    jest
      .spyOn(prisma.galleries, 'findMany')
      .mockResolvedValue([mockGallery] as any);

    await service.getAllUsersGallery(mockUserId, {
      page: 1,
      limit: 10,
      to: '2024-12-31',
    });

    expect(prisma.galleries.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ lte: expect.any(Date) }),
        }),
      }),
    );
  });

  it('фильтрует галереи по minImages и maxImages', async () => {
    jest
      .spyOn(prisma.galleries, 'findMany')
      .mockResolvedValue([mockGallery] as any);

    await service.getAllUsersGallery(mockUserId, {
      page: 1,
      limit: 10,
      minImages: 1,
      maxImages: 5,
    });

    expect(prisma.galleries.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          imagesCount: expect.objectContaining({ gte: 1, lte: 5 }),
        }),
      }),
    );
  });
});
