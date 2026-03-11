import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendEmail(to: string, subject: string, html: string) {
    return this.resend.emails.send({
      from: process.env.MAILER_FROM as string,
      to,
      subject,
      html,
    });
  }
}