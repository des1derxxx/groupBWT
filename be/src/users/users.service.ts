import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.users.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    return user;
  }

  async findOneBy(email: string) {
    return await this.prisma.users.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.users.create({
      data: createUserDto,
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { firstname, lastname, email, password } = updateUserDto;

    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const dataToUpdate: any = {
      firstname,
      lastname,
      email,
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    return this.prisma.users.update({
      where: { id },
      data: dataToUpdate,
    });
  }
}
