import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateReservationService } from '../services/createReservation.service';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { FindAllReservationService } from '../services/findAllReservation.service';
import { FindByIdReservationService } from '../services/findByIdReservation.service';
import { FindByUserReservationService } from '../services/findByUserReservation.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ReservationStatus, Role } from '@prisma/client';
import { UpdateStatusReservationService } from '../services/updateStatusReservation.service';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decotaror';
import { UpdateStatusReservationDto } from '../domain/dto/update-status-reservation.dto';
import { FindByHotelReservation } from '../services/findByHotelReservation.service';

@UseGuards(AuthGuard, RoleGuard)
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationService: CreateReservationService,
    private readonly findAllReservationService: FindAllReservationService,
    private readonly findByIdReservationService: FindByIdReservationService,
    private readonly findByUserReservationService: FindByUserReservationService,
    private readonly findByHotelReservationService: FindByHotelReservation,
    private readonly updateStatusReservationService: UpdateStatusReservationService,
  ) {}
  @Roles(Role.USER)
  @Post()
  create(@User('id') id: number, @Body() body: CreateReservationDto) {
    return this.createReservationService.execute(id , body);
  }

  @Get()
  findAll() {
    return this.findAllReservationService.execute();
  }
  
  @Get('user')
  findByUser(@User('id') id: number){
    return this.findByUserReservationService.execute(id);
  }

  @Get('hotel/:id')
  findByHotel(@Param('id') id: number){
    return this.findByHotelReservationService.execute(id);
  }

  @Get(':id')
  finById(@Param('id') id: number){
    return this.findByIdReservationService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  updateStatus(@ParamId() id: number, @Body() body: UpdateStatusReservationDto) {
    return this.updateStatusReservationService.execute(id, body.status)
}

}