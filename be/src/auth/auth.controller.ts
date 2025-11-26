import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseUser } from '../users/dto/user.dto';
import { Public } from './public-strategy';
import { AuthTokenDto } from './dto/auth-token.dto';
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
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
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
  signUp(@Body() signUpDto: Record<string, any>) {
    const payload = {
      firstname: signUpDto.firstname,
      lastname: signUpDto.lastname,
      email: signUpDto.email,
      password: signUpDto.password,
      createdAt: new Date(),
    };
    return this.authService.signUp(payload);
  }
}
