import { Module, forwardRef } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { GalleriesModule } from 'src/galleries/galleries.module';

@Module({
  imports: [forwardRef(() => GalleriesModule)],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
