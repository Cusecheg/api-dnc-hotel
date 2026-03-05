import { Reservation, ReservationStatus, Prisma } from "@prisma/client";
import { CreateReservationDto } from "../dto/create-reservation.dto";

export interface IReservationRepository {
    create(data: any): Promise<Prisma.ReservationGetPayload<{ include: { 
        hotel: {
            select: { name: true}
        }
    }}>>;
    findById(id: number): Promise<Prisma.ReservationGetPayload<{
        include: {
            hotel: { include: { owner: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } } },  },
            user: { select: {name: true, email: true, role: true, avatar: true, createdAt: true}},
        }
    }> | null>;
    findAll(): Promise<Reservation[]>;
    findByUser(userId: number): Promise<Prisma.ReservationGetPayload<{
        include: {
            hotel: { include: { owner: true} };
        }
    }>[]>;

    findByHotel(id: number): Promise<Reservation[]>;

    updateStatus(id: number, status: ReservationStatus): Promise<Reservation>;
}