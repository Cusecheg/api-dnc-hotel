import { Prisma, Hotel } from '@prisma/client';
import { CreateHotelDto } from '../domain/dto/create-hotel.dto';
import { IHotelRepository } from '../domain/repositories/Ihotel.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HotelsRepositories implements IHotelRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: CreateHotelDto, ownerId: number): Promise<Hotel> {

    if(data){
    }

    return this.prisma.hotel.create({ data: {
      name: data.name,
      description: data.description,
      address: data.address,
      price: data.price,
      ownerId: ownerId,
    } });
  }
  findHotelById(id: number): Promise<Prisma.HotelGetPayload<{
    include: {
      owner: {
        select: {
          id: true;
          name: true;
          email: true;
          avatar: true,
          createdAt: true;
        };
      };
    };
  }> | null> {
    return this.prisma.hotel.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });
  }
  findHotelByName(name: string): Promise<Hotel[] | null> {
    return this.prisma.hotel.findMany({ where: { name: { contains: name } } });
  }
  findHotels(page: number, limit: number): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({
      skip: page,
      take: limit,
      include: { owner: { select: { id: true, name: true, email: true, avatar: true}} },
    });
  }

  hotelsCount(): Promise<number> {
    return this.prisma.hotel.count();
  }

  findHotelByOwner(ownerId: number): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({ where: { ownerId } });
  }
  update(id: number, data: Partial<CreateHotelDto>): Promise<Hotel> {
    return this.prisma.hotel.update({ where: { id }, data });
  }
  delete(id: number): Promise<Hotel> {
    return this.prisma.hotel.delete({ where: { id } });
  }
}
