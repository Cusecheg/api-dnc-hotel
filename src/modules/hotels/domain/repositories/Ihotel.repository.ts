import { Hotel, Prisma } from '@prisma/client';
import { CreateHotelDto } from '../dto/create-hotel.dto';

export interface IHotelRepository {
  create(data: CreateHotelDto, ownerId: number): Promise<Hotel>;
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
  }> | null>;
  findHotelByName(name: string): Promise<Hotel[] | null>;
  findHotelByOwner(ownerId: number): Promise<Hotel[]>;
  findHotels(page: number, limit: number): Promise<Hotel[]>;
  hotelsCount(): Promise<number>;
  update(id: number, data: Partial<CreateHotelDto>): Promise<Hotel>;
  delete(id: number): Promise<Hotel>;
}
