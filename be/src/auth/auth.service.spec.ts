import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'uuid-1',
    firstname: 'Ivan',
    lastname: 'Ivanov',
    email: 'ivan@test.com',
    password: 'hashed-password',
  };

  const mockUsersService = {
    findOneBy: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('успешный вход', async () => {
      mockUsersService.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signIn(mockUser.email, 'password');

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(usersService.findOneBy).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id });
    });

    it('ошибка если юзер не найден', async () => {
      mockUsersService.findOneBy.mockResolvedValue(null);

      await expect(
        service.signIn('wrong@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('ошибка если пароль не совпадает', async () => {
      mockUsersService.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signIn(mockUser.email, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    it('успешная регистрация', async () => {
      const createUserDto = {
        firstname: 'Ivan',
        lastname: 'Ivanov',
        email: 'ivan@test.com',
        password: 'password',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUsersService.create.mockResolvedValue({
        ...createUserDto,
        id: 'uuid-1',
        password: 'hashed-password',
      });
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signUp(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });
  });
});
