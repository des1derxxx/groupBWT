import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GalleriesModule } from './galleries/galleries.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, GalleriesModule, ImagesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
