import { Module, Global } from '@nestjs/common';
import { EmailService } from './resend.service';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService]
})
export class ResendModule {}