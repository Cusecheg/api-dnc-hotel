import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { RESERVATION_TOKEN_REPOSITORY } from '../utils/reservation.token.reposository';
import type { IReservationRepository } from '../domain/repositories/ireservation.repository';
import { differenceInDays, parseISO } from 'date-fns';
import type { IHotelRepository } from 'src/modules/hotels/domain/repositories/Ihotel.repository';
import { HOTEL_TOKEN_REPOSITORY } from 'src/modules/hotels/utils/hotel.token.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from 'src/shared/microservices/resend/resend';
@Injectable()
export class CreateReservationService {
  constructor(
    @Inject(RESERVATION_TOKEN_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(HOTEL_TOKEN_REPOSITORY)
    private readonly hotelRepository: IHotelRepository,
    private readonly emailService: EmailService,
    // private readonly mailerService: MailerService,
  ){}

  async execute(id: number, data: CreateReservationDto) {
    const checkInDate = parseISO(data.checkIn);
    const checkOutDate = parseISO(data.checkOut);
    const daysOfStay = differenceInDays(checkOutDate, checkInDate);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    const hotel = await this.hotelRepository.findHotelById(data.hotelId);
    if (!hotel){
      throw new NotFoundException('Hotel not found');
    }

    if (typeof hotel.price !== 'number' || hotel.price <= 0){
      throw new BadRequestException('Invalid hotel price');
    }

    const total = daysOfStay * hotel.price;

    const newReservation = {
      ...data,
      userId: id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      total,
    };
    const reservation = await this.reservationRepository.create(newReservation)

    await this.emailService.sendEmail(
      hotel.owner.email,
      'New Reservation Created',
      `
      <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:24px;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="background:#0d6efd; color:#fff; padding:20px 24px;">
          <h1 style="margin:0; font-size:20px;">Nueva reserva recibida</h1>
        </div>

        <div style="padding:24px; color:#333;">
          <p>Hola,</p>

          <p>Se ha creado una nueva reserva para tu alojamiento <strong>${reservation.hotel.name}</strong>.</p>

          <table style="width:100%; border-collapse:collapse; margin-top:12px;">
            <tr>
              <td style="padding:8px; border:1px solid #eee;"><strong>Reserva</strong></td>
              <td style="padding:8px; border:1px solid #eee;">${reservation.id}</td>
            </tr>
            <tr>
              <td style="padding:8px; border:1px solid #eee;"><strong>Check-in</strong></td>
              <td style="padding:8px; border:1px solid #eee;">${reservation.checkIn}</td>
            </tr>
            <tr>
              <td style="padding:8px; border:1px solid #eee;"><strong>Check-out</strong></td>
              <td style="padding:8px; border:1px solid #eee;">${reservation.checkOut}</td>
            </tr>
            <tr>
              <td style="padding:8px; border:1px solid #eee;"><strong>Total</strong></td>
              <td style="padding:8px; border:1px solid #eee;">${reservation.total}</td>
            </tr>
          </table>

          <p style="margin-top:16px; color:#555;">
            Revisa los detalles en tu panel de administración o contacta al huésped para coordinar.
          </p>

          <p style="margin-top:24px; font-size:13px; color:#888;">
            Si no esperabas esta notificación, ignora este correo.
          </p>
        </div>

        <div style="background:#f1f3f5; padding:12px 24px; text-align:center; color:#666; font-size:12px;">
          &copy; 2025 DNC Hotel
        </div>
      </div>
      </div>
      `,
  )

    return reservation;

  }

}
