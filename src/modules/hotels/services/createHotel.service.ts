import { Inject, Injectable } from '@nestjs/common';
import { CreateHotelDto } from '../domain/dto/create-hotel.dto';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repository';
import { HOTEL_TOKEN_REPOSITORY } from '../utils/hotel.token.repository';
import Redis from 'ioredis';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';
import { FindAllHotelService } from './findAllHotel.service';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CreateHotelService {
  constructor(
    @Inject(HOTEL_TOKEN_REPOSITORY)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly findAllHotelsService: FindAllHotelService,
  ){}
  async execute(createHotelDto: CreateHotelDto, ownerId: number){

    const hotel = await this.hotelRepositories.create(createHotelDto, ownerId);

    if (hotel){
      await this.redis.flushdb();
      await this.findAllHotelsService.execute(1, 10);
    }
    return hotel;
  }

}
