import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { MoveImageDto } from './dto/move-image.dto';
import { BadRequestException } from '@nestjs/common';

describe('ImagesController', () => {
  let controller: ImagesController;
  let service: ImagesService;

  const mockUserId = 'user-1';
  const mockGalleryId = 'gallery-1';
  const mockImageId = 'image-1';

  const mockService = {
    uploadImage: jest.fn(),
    remove: jest.fn(),
    moveImage: jest.fn(),
    copyImage: jest.fn(),
    getImagesByGallery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [{ provide: ImagesService, useValue: mockService }],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    service = module.get<ImagesService>(ImagesService);

    jest.clearAllMocks();
  });

  it('вызывает сервис и возвращает результат', async () => {
    const files = [
      { originalname: 'test.jpg', buffer: Buffer.from('') },
    ] as Express.Multer.File[];
    const dto: CreateImageDto = { galleryId: mockGalleryId };
    const serviceResult = { message: 'uploaded', count: 1, images: [] };

    mockService.uploadImage.mockResolvedValue(serviceResult);

    const result = await controller.uploadImages(files, dto, mockUserId);
    expect(result).toEqual(serviceResult);
    expect(mockService.uploadImage).toHaveBeenCalledWith(
      files,
      dto,
      mockUserId,
    );
  });
  it('при ошибке', async () => {
    const files = [
      { originalname: 'test.jpg', buffer: Buffer.from('') },
    ] as Express.Multer.File[];
    const dto: CreateImageDto = { galleryId: mockGalleryId };

    mockService.uploadImage.mockRejectedValue(new BadRequestException('fail'));

    await expect(
      controller.uploadImages(files, dto, mockUserId),
    ).rejects.toThrow(BadRequestException);
  });
  it('вызывает сервис и возвращает результат', async () => {
    const serviceResult = 'Deleted image';
    mockService.remove.mockResolvedValue(serviceResult);

    const result = await controller.remove(mockImageId, mockUserId);
    expect(result).toBe(serviceResult);
    expect(mockService.remove).toHaveBeenCalledWith(mockImageId, mockUserId);
  });
  it('вызывает сервис и возвращает результат', async () => {
    const dto: MoveImageDto = { galleryId: 'gallery-2' };
    const serviceResult = { message: 'Moved', image: {} };
    mockService.moveImage.mockResolvedValue(serviceResult);

    const result = await controller.moveImage(mockImageId, dto, mockUserId);
    expect(result).toEqual(serviceResult);
    expect(mockService.moveImage).toHaveBeenCalledWith(
      mockImageId,
      dto,
      mockUserId,
    );
  });
  it('вызывает сервис и возвращает результат', async () => {
    const dto: MoveImageDto = { galleryId: 'gallery-2' };
    const serviceResult = { message: 'Copied', image: {} };
    mockService.copyImage.mockResolvedValue(serviceResult);

    const result = await controller.copyImage(mockImageId, dto, mockUserId);
    expect(result).toEqual(serviceResult);
    expect(mockService.copyImage).toHaveBeenCalledWith(
      mockImageId,
      dto,
      mockUserId,
    );
  });
  it('сервис с пагинацией и возвращает результат', async () => {
    const serviceResult = {
      images: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      galleryId: mockGalleryId,
    };
    mockService.getImagesByGallery.mockResolvedValue(serviceResult);

    const result = await controller.getImagesByGallery(
      mockGalleryId,
      1,
      10,
      mockUserId,
    );
    expect(result).toEqual(serviceResult);
    expect(mockService.getImagesByGallery).toHaveBeenCalledWith(
      mockGalleryId,
      1,
      10,
      mockUserId,
    );
  });
});
