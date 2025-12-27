import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('должен вернуть токен при успешной авторизации', async () => {
      const loginDto: LoginDto = {
        email: 'ivan@test.com',
        password: 'password',
      };
      const tokenResponse = { access_token: 'jwt-token' };

      mockAuthService.signIn.mockResolvedValue(tokenResponse);

      const result = await controller.signIn(loginDto);

      expect(result).toEqual(tokenResponse);
      expect(authService.signIn).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('должен выбросить ошибку при неверных данных', async () => {
      const loginDto: LoginDto = {
        email: 'wrong@test.com',
        password: 'password',
      };
      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      await expect(controller.signIn(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.signIn).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('signUp', () => {
    it('должен зарегистрировать пользователя и вернуть токен', async () => {
      const registerDto: RegisterDto = {
        firstname: 'Ivan',
        lastname: 'Ivanov',
        email: 'ivan@test.com',
        password: 'password',
      };
      const tokenResponse = { access_token: 'jwt-token' };

      mockAuthService.signUp.mockResolvedValue(tokenResponse);

      const result = await controller.signUp(registerDto);

      expect(result).toEqual(tokenResponse);
      expect(authService.signUp).toHaveBeenCalledWith(registerDto);
    });

    it('ошибка если email уже есть', async () => {
      const registerDto: RegisterDto = {
        firstname: 'Ivan',
        lastname: 'Ivanov',
        email: 'ivan@test.com',
        password: 'password',
      };

      mockAuthService.signUp.mockRejectedValue({
        status: 400,
        message: 'Email уже используется',
      });

      await expect(controller.signUp(registerDto)).rejects.toEqual({
        status: 400,
        message: 'Email уже используется',
      });
      expect(authService.signUp).toHaveBeenCalledWith(registerDto);
    });
  });
});
