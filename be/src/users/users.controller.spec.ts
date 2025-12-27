import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  NotFoundException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

const mockCurrentUserId = 'user-id-1';

const mockUser = {
  id: mockCurrentUserId,
  firstname: 'Ivan',
  lastname: 'Ro',
  email: 'ivan@test.com',
  createdAt: new Date(),
};

const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateUser: jest.fn(),
};

@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });
  describe('получение данных', () => {
    it('данные юзера', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getUserData(mockCurrentUserId);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(mockCurrentUserId);
    });
  });
  describe('создание', () => {
    it('создание юзера', async () => {
      const createDto = {
        firstname: 'Ivan',
        lastname: 'Ro',
        email: 'ivan@test.com',
        password: '12345678',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('массив юзеров', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('юзер по айди', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockCurrentUserId);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(mockCurrentUserId);
    });

    it('ошибка когда не найден юзер', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('wrong-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('обновление', () => {
    it('обновление данных', async () => {
      const updateDto = { firstname: 'NewName' };
      mockUsersService.updateUser.mockResolvedValue({
        ...mockUser,
        firstname: 'NewName',
      });

      const result = await controller.updateUser(mockCurrentUserId, updateDto);

      expect(result).toEqual({
        ...mockUser,
        firstname: 'NewName',
      });
      expect(service.updateUser).toHaveBeenCalledWith(
        mockCurrentUserId,
        updateDto,
      );
    });

    it('ошибка при обновлении', async () => {
      const updateDto = { firstname: 'NewName' };
      mockUsersService.updateUser.mockRejectedValue(new NotFoundException());

      await expect(
        controller.updateUser('wrong-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
