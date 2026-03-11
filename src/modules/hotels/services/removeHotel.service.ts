import { Inject, Injectable } from '@nestjs/common';
import { HOTEL_TOKEN_REPOSITORY } from '../utils/hotel.token.repository';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repository';
import Redis from 'ioredis';


@Injectable()
export class RemoveHotelService {
  constructor(
    @Inject(HOTEL_TOKEN_REPOSITORY)
    private readonly hotelRepositories: IHotelRepository,
    private readonly redis: Redis
  ){}
  async execute(id: number) {
    await this.redis.flushdb();
    return this.hotelRepositories.delete(id);
  }
}
