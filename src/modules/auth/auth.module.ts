import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.model";
import { AuthController } from "./auth.controller";
import { UserModule } from "../users/user.module";
import { EmailService } from "src/shared/microservices/resend/resend.service";


@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
        }),
        PrismaModule,
        forwardRef(() => UserModule)
    ],
    controllers: [AuthController],
    providers: [AuthService, EmailService],
    exports: [AuthService],
})
export class AuthModule {}