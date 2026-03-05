import { Inject, Injectable } from "@nestjs/common";
import { RESERVATION_TOKEN_REPOSITORY } from "../utils/reservation.token.reposository";
import type { IReservationRepository } from "../domain/repositories/ireservation.repository";
import { ReservationStatus } from "@prisma/client";
import { UpdateStatusReservationDto } from "../domain/dto/update-status-reservation.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { ShowUserService } from "src/modules/users/services/showUser.service";

@Injectable()
export class UpdateStatusReservationService {
  constructor(
    @Inject(RESERVATION_TOKEN_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly showUserService: ShowUserService,
    private readonly mailerService: MailerService,
  ){}
    async execute(id: number, status: ReservationStatus ) {
        const reservation = await this.reservationRepository.updateStatus(id, status);
        const user = await this.showUserService.execute(reservation.userId);
        let statusMessage = '';
        let subjectMessage = '';
        let statusColor = '';
        
        if (reservation.status === ReservationStatus.REJECTED) {
          statusMessage = 'Your reservation has been rejected.';
          subjectMessage = 'Reservation Rejected';
          statusColor = '#ff4e4e';
        }
        
        if (reservation.status === ReservationStatus.APPROVED) {
          statusMessage = 'Your reservation has been approved!';
          subjectMessage = 'Reservation Approved';
          statusColor = '#28a745';
        }
        
        const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <table align="center" cellpadding="0" cellspacing="0" width="600" 
            style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); overflow: hidden;">
            <tr>
              <td style="background-color: #1d72b8; color: white; text-align: center; padding: 20px 0;">
                <h2 style="margin: 0;">Reservation Status Update</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center;">
                <p style="font-size: 18px; margin: 10px 0; color: ${statusColor}; font-weight: bold;">
                  ${statusMessage}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 30px 20px 30px;">
                <table width="100%" cellpadding="8" cellspacing="0" 
                  style="border-collapse: collapse; background-color: #fafafa; border-radius: 6px;">
                  <tr>
                    <td style="border-bottom: 1px solid #ddd;"><strong>Reservation ID:</strong></td>
                    <td style="border-bottom: 1px solid #ddd;">${reservation.id}</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #ddd;"><strong>User:</strong></td>
                    <td style="border-bottom: 1px solid #ddd;">${user.name}</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                    <td style="border-bottom: 1px solid #ddd;">${user.email}</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #ddd;"><strong>Check-in Date:</strong></td>
                    <td style="border-bottom: 1px solid #ddd;">${reservation.checkIn}</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #ddd;"><strong>Check-out Date:</strong></td>
                    <td style="border-bottom: 1px solid #ddd;">${reservation.checkOut}</td>
                  </tr>
                  <tr>
                    <td><strong>Reservation Total:</strong></td>
                    <td>${reservation.total}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; color: #777; font-size: 14px; padding: 20px;">
                <p style="margin: 0;">If you have any questions, feel free to contact us.</p>
                <p style="margin: 5px 0;">Thank you for choosing our service!</p>
              </td>
            </tr>
          </table>
        </div>
      `;

        await this.mailerService.sendMail({
          to: user.email,
          subject: subjectMessage,
          html: htmlTemplate
        })

        return reservation;
    }

    

}


