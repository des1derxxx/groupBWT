import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GalleriesModule } from './galleries/galleries.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, GalleriesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
