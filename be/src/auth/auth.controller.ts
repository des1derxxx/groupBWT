import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseUser } from '../users/dto/user.dto';
import { Public } from './public-strategy';
import { AuthTokenDto } from './dto/auth-token.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({
    status: 200,
    description: 'JWT токен успешно выдан',
    type: AuthTokenDto,
  })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
  signIn(@Body() dto: LoginDto) {
    return this.authService.signIn(dto.email, dto.password);
  }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно создан',
    type: BaseUser,
  })
  @ApiResponse({ status: 400, description: 'Email уже используется' })
  signUp(@Body() dto: RegisterDto) {
    const payload = {
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      password: dto.password,
    };
    return this.authService.signUp(payload);
  }
}
