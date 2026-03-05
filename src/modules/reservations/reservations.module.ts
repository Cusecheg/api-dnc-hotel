import { Module } from '@nestjs/common';

import { ReservationController } from './infra/reservation.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { HotelsModule } from '../hotels/hotels.module';
import { RESERVATION_TOKEN_REPOSITORY } from './utils/reservation.token.reposository';
import { ReservationRepository } from './infra/reservation.repository';
import { PrismaModule } from '../prisma/prisma.model';
import { CreateReservationService } from './services/createReservation.service';
import { HOTEL_TOKEN_REPOSITORY } from '../hotels/utils/hotel.token.repository';
import { HotelsRepositories } from '../hotels/infra/hotels.repository';
import { FindAllReservationService } from './services/findAllReservation.service';
import { FindByIdReservationService } from './services/findByIdReservation.service';
import { FindByUserReservationService } from './services/findByUserReservation.service';
import { FindByHotelReservation } from './services/findByHotelReservation.service';
import { UpdateStatusReservationService } from './services/updateStatusReservation.service';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, HotelsModule],
  controllers: [ReservationController],
  providers: [
    CreateReservationService, 
    FindAllReservationService,
    FindByIdReservationService,
    FindByUserReservationService,
    FindByHotelReservation,
    UpdateStatusReservationService,
  {
    provide: RESERVATION_TOKEN_REPOSITORY,
    useClass: ReservationRepository,
  },
  {
    provide: HOTEL_TOKEN_REPOSITORY,
    useClass: HotelsRepositories
  }
],
})
export class ReservationsModule {}
