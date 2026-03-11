import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HOTEL_TOKEN_REPOSITORY } from '../utils/hotel.token.repository';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repository';
import { join, resolve } from 'path';
import { stat, unlink } from 'fs/promises';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';


@Injectable()
export class UploadImageHotelService {
  constructor(
    @Inject(HOTEL_TOKEN_REPOSITORY)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis()
    private readonly redis: Redis,
  ){}
  async execute(id: number, imageFileName: string) {

    const hotel = await this.hotelRepositories.findHotelById(id);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    const directory = resolve(process.cwd(), 'uploads-hotels');
    if (hotel.image) {
        const hotelImageFilePath = join(directory, hotel.image);
    try {
        await stat(hotelImageFilePath);
        await unlink(hotelImageFilePath);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err; // Solo ignora si el archivo no existe
    }
    }
    await this.redis.flushdb();

    return await this.hotelRepositories.update( id, 
      {
        image: imageFileName
      });
  
}}
