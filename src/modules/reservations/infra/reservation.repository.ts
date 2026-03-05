import { Injectable } from '@nestjs/common';
import type { IReservationRepository } from '../domain/repositories/ireservation.repository';
import { Prisma, Reservation, ReservationStatus } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any): Promise<
    Prisma.ReservationGetPayload<{
      include: {
        hotel: {
          select: { name: true };
        };
      };
    }>
  > {
    return this.prisma.reservation.create({
      data,
      include: {
        hotel: {
          select: { name: true },
        },
      },
    });
  }

  findById(id: number): Promise<Prisma.ReservationGetPayload<{
    include: {
      hotel: { include: { owner: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } } } },
      user: {select: {name: true, email: true, role: true, avatar: true, createdAt: true}},
    };
  }> | null> {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        hotel: { include: { owner: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } } } },
         user: {select: {name: true, email: true, role: true, avatar: true, createdAt: true}}
      },
    });
  }


        

  findAll(): Promise<Reservation[]> {
    return this.prisma.reservation.findMany();
  }

  findByUser(userId: number): Promise<Prisma.ReservationGetPayload<{
    include: {
      hotel: { include: { owner: true} };
    };
  }>[]> {
    return this.prisma.reservation.findMany({ where: { userId }, include: { hotel: { include: { owner: true} } } });
  }

  findByHotel(id: number): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({ where: { hotelId: id}, include: { user: { select: { id: true, name: true, email: true, role: true,
      avatar: true, createdAt: true, }}}, orderBy: { createdAt: 'desc' }})
  }

  updateStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    return this.prisma.reservation.update({
      where: { id },
      data: { status },
    });
  }
}
