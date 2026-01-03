import { Module, forwardRef } from '@nestjs/common';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';
import { ImagesModule } from 'src/images/images.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => ImagesModule), UsersModule],
  controllers: [GalleriesController],
  providers: [GalleriesService],
})
export class GalleriesModule {}
