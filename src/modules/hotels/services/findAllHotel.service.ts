import { Inject, Injectable } from '@nestjs/common';
import { HOTEL_TOKEN_REPOSITORY } from '../utils/hotel.token.repository';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';
import { Hotel } from '@prisma/client';


@Injectable()
export class FindAllHotelService {
  constructor(
    @Inject(HOTEL_TOKEN_REPOSITORY)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async execute(page: number, limit: number) {
    const offSet = (page - 1) * limit;

    let data: any;

    try {
      // Intentamos acceder a Redis
      const dataRedis = await this.redis.get(`${REDIS_HOTEL_KEY}:page:${page}:limit:${limit}`);
      if (dataRedis) {
        data = JSON.parse(dataRedis);
      } else {
        data = null;
      }
    } catch (error) {
      console.error('Error al conectar a Redis, buscando en DB...', error);
      // Si ocurre un error de conexión con Redis, buscamos en la base de datos
      data = null;
    }

    // Si no encontramos datos en Redis (o hubo error en la conexión), vamos a la DB
    if (!data) {
      console.log('Buscando en la base de datos...');
      try {
        // Aquí es donde realmente buscas los datos en la base de datos
        data = await this.hotelRepositories.findHotels(offSet, limit);
        // data = data.map((hotel: Hotel) => {
        //   if (hotel.image) {
        //     hotel.image = `${process.env.APP_API_URL}/uploads-hotels/${hotel.image}`;
        //   }
        //   return hotel;
        // });

        // Almacenamos los datos obtenidos en la base de datos en Redis para futuras peticiones
        try {
          console.log('Guardando datos en Redis...');
          await this.redis.set(`${REDIS_HOTEL_KEY}:page:${page}:limit:${limit}`, JSON.stringify(data));
        } catch (error) {
          console.error('Error al guardar en Redis:', error);
        }
      } catch (dbError) {
        console.error('Error al obtener datos de la base de datos:', dbError);
        // Aquí puedes manejar el error si la DB también falla (puedes lanzar una excepción o devolver un resultado vacío)
        data = [];
      }
    }

    const total = await this.hotelRepositories.hotelsCount();

    return {
      total,
      page,
      per_page: limit,
      data,
    };
  }
}
