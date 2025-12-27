import { Test, TestingModule } from '@nestjs/testing';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';
import { GalleryQueryDto } from './dto/galleryQuery.dto';

describe('GalleriesController', () => {
  let controller: GalleriesController;
  let service: jest.Mocked<GalleriesService>;

  const mockUserId = 'user-1';
  const mockGalleryId = 'gallery-1';

  const mockGallery = {
    id: mockGalleryId,
    title: 'Test gallery',
    description: 'Description',
    createdAt: new Date(),
    imagesCount: 3,
    userId: mockUserId,
  };

  const galleriesServiceMock: jest.Mocked<GalleriesService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    getAllUsersGallery: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GalleriesController],
      providers: [
        {
          provide: GalleriesService,
          useValue: galleriesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<GalleriesController>(GalleriesController);
    service = module.get(GalleriesService);

    jest.clearAllMocks();
  });
  describe('create', () => {
    it('создание галереи', async () => {
      service.create.mockResolvedValue(mockGallery as any);

      const dto: CreateGalleryDto = {
        title: 'Test gallery',
        description: 'Description',
      };

      const result = await controller.create(dto, mockUserId);

      expect(service.create).toHaveBeenCalledWith(dto, mockUserId);
      expect(result).toEqual(mockGallery);
    });
  });
  describe('findAll', () => {
    it('все галереи', async () => {
      service.findAll.mockResolvedValue([mockGallery] as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockGallery]);
    });
  });

  describe('getAllUsersGallery', () => {
    it('возвращает галереи юзера', async () => {
      service.getAllUsersGallery.mockResolvedValue({
        items: [mockGallery],
        total: 1,
        page: 1,
        limit: 10,
      });

      const query: GalleryQueryDto = {
        page: 1,
        limit: 10,
      };

      const result = await controller.getAllUsersGallery(mockUserId, query);

      expect(service.getAllUsersGallery).toHaveBeenCalledWith(
        mockUserId,
        query,
      );
      expect(result.items.length).toBe(1);
    });
  });
  describe('findOne', () => {
    it('галереи по айди', async () => {
      service.findOne.mockResolvedValue(mockGallery as any);

      const result = await controller.findOne(mockGalleryId);

      expect(service.findOne).toHaveBeenCalledWith(mockGalleryId);
      expect(result).toEqual(mockGallery);
    });
  });
  describe('update', () => {
    it('обновление галереи', async () => {
      service.update.mockResolvedValue({
        ...mockGallery,
        title: 'Updated',
      } as any);

      const dto: UpdateGalleryDto = {
        title: 'Updated',
      };

      const result = await controller.update(mockGalleryId, dto);

      expect(service.update).toHaveBeenCalledWith(mockGalleryId, dto);
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('удаление галереи', async () => {
      service.remove.mockResolvedValue({
        message: 'Галерея удалена',
      });

      const result = await controller.remove(mockGalleryId, mockUserId);

      expect(service.remove).toHaveBeenCalledWith(mockGalleryId, mockUserId);
      expect(result.message).toContain('удалена');
    });
  });
});
