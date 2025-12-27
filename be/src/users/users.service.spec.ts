import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('юзер сервис', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUser = {
    id: 'uuid-1',
    firstname: 'Ivan',
    lastname: 'Ivanov',
    email: 'ivan@test.com',
    password: 'hashed-password',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });
  it('должно вернуть всех юзеров', async () => {
    mockPrismaService.users.findMany.mockResolvedValue([mockUser]);

    const result = await service.findAll();

    expect(result).toEqual([mockUser]);
    expect(prisma.users.findMany).toHaveBeenCalled();
  });

  it('вернет юзера по айди', async () => {
    mockPrismaService.users.findUnique.mockResolvedValue({
      id: mockUser.id,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });

    const result = await service.findOne(mockUser.id);

    expect(result.id).toBe(mockUser.id);
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        createdAt: true,
      },
    });
  });

  it('ошибка если нет юзера', async () => {
    mockPrismaService.users.findUnique.mockResolvedValue(null);

    await expect(service.findOne('wrong-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('найдет юзера по емейлу', async () => {
    mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

    const result = await service.findOneBy(mockUser.email);

    expect(result).toEqual(mockUser);
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
  });

  it('создать юзера', async () => {
    const dto = {
      firstname: 'Ivan',
      lastname: 'Ivanov',
      email: 'ivan@test.com',
      password: '123456',
    };

    mockPrismaService.users.create.mockResolvedValue(mockUser);

    const result = await service.create(dto);

    expect(result).toEqual(mockUser);
    expect(prisma.users.create).toHaveBeenCalledWith({
      data: dto,
    });
  });

  it('обновить юзера без пароля', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: mockUser.id,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });

    mockPrismaService.users.update.mockResolvedValue(mockUser);

    const result = await service.updateUser(mockUser.id, {
      firstname: 'NewName',
    });

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: {
        firstname: 'NewName',
        lastname: undefined,
        email: undefined,
      },
    });

    expect(result).not.toHaveProperty('password');
  });

  it('обновление пароля', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: mockUser.id,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });

    mockPrismaService.users.update.mockResolvedValue({
      ...mockUser,
      password: 'new-hash',
    });

    const result = await service.updateUser(mockUser.id, {
      password: 'new-password',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
    expect(result).not.toHaveProperty('password');
  });

  it('ошибка при обновлении юзер не найден', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValue(new NotFoundException('User not found'));

    await expect(
      service.updateUser('wrong-id', { firstname: 'Test' }),
    ).rejects.toThrow(NotFoundException);
  });
});
