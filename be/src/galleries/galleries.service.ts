import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGalleryDto } from './dto/createGalleries.dto';
import { UpdateGalleryDto } from './dto/updateGalleries.dto';


@Injectable()
export class GalleriesService {
  constructor(private prisma: PrismaService) {}


  async create(dto: CreateGalleryDto) {
    const gallery = await this.prisma.galleries.create({ 
      data: dto,

    })
    return gallery
  }

  async findAll() {
    const galleries = await this.prisma.galleries.findMany()
    return galleries
  }

  async findOne(id: string) {
    const gallery =  await this.prisma.galleries.findUnique({where: {id}})
    return gallery
  }

  async update(id: string, dto: UpdateGalleryDto) {
    const gallery = await this.prisma.galleries.update({where:{id}, data:dto})
    return gallery
  }

  async remove(id: string) {
    await this.prisma.galleries.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
