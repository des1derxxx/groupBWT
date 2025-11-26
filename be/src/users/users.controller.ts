import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseUser } from './dto/user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('/profile')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль успешно получен',
    type: BaseUser,
  })
  async getUserData(@Req() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: BaseUser,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей успешно получен',
    type: [BaseUser],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по идентификатору' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь найден',
    type: BaseUser,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно обновлён',
    type: BaseUser,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
