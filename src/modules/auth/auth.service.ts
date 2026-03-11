import { Body, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role, User } from "@prisma/client";
import { AuthLoginDTO } from "./domain/dto/authLogin.dto";
import * as bcrypt from 'bcrypt';
import { AuthRegisterDTO } from "./domain/dto/authRegister.dto";
import { CreateUserDTO } from "../users/domain/dto/createUser.dto";
import { AuthResetPasswordDTO } from "./domain/dto/authResetPassword.dto";
import { AuthForgotPasswordDTO } from "./domain/dto/authForgotPassword.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { CreateUserService } from "../users/services/createUser.service";
import { FindByEmailUserService } from "../users/services/findByEmailIUser.service";
import { UpdateUserService } from "../users/services/updateUser.service";
import { EmailService } from "src/shared/microservices/resend/resend";



@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly createUserService: CreateUserService,
        private readonly findByEmailUserService: FindByEmailUserService,
        private readonly updateUserService: UpdateUserService,
        // private readonly mailerService: MailerService,
        private readonly emailService: EmailService,
    ) {}

    async generateToken(user: User, expiresIn = '24h') {
        const payload = { sub: user.id, name: user.name, role: user.role };
        const options = { 
            expiresIn: expiresIn,
            issuer: 'dnc_hotel',
            audience: 'users',
            secret: process.env.JWT_SECRET
         }; 
        return {access_token: this.jwtService.sign(payload, options)};
    }

    async login({ email, password }: AuthLoginDTO){
        const user = await this.findByEmailUserService.execute(email);

        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return await this.generateToken(user);
    }

    async register(body: AuthRegisterDTO){

        const newUser: CreateUserDTO = {
            name: body.name,
            email: body.email,
            password: body.password,
            role: body.role ?? Role.USER,
        };
        const user = await this.createUserService.execute(newUser);
        return this.generateToken(user);
    }

    async reset({ token, password }: AuthResetPasswordDTO){
        const { valid, decoded } = await this.validateToken(token);

        if (!valid) throw new UnauthorizedException('Invalid or expired token');
        
        const user = await this.updateUserService.execute(decoded.sub, { password: await bcrypt.hash(password, 10) });

        return user;
    }

    async forgot({email}: AuthForgotPasswordDTO){
        const user = await this.findByEmailUserService.execute(email);
        if (!user) throw new UnauthorizedException('Email not found');

        const { access_token } = await this.generateToken(user, '30m');

        await this.emailService.sendEmail(
            user.email,
            'Reset Password - DNC Hotel',
            `
            <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 32px;">
                <h2 style="color: #333; margin-bottom: 16px;">Restablece tu contraseña</h2>
                <p style="color: #555; margin-bottom: 24px;">
                Hola, hemos recibido una solicitud para restablecer tu contraseña.<br>
                Copia el siguiente token y pegalo en la página de restablecimiento de contraseña:
                </p>
                <p style="display: inline-block; background: #007bff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">  
                ${access_token}
                </p>
                <p style="color: #888; font-size: 13px; margin-top: 32px;">
                Si no solicitaste este cambio, puedes ignorar este correo.
                </p>
                <hr style="margin: 32px 0;">
                <p style="color: #bbb; font-size: 12px; text-align: center;">
                &copy; 2025 DNC Hotel. Todos los derechos reservados.
                </p>
            </div>
            </div>
            `,
        )

        return `If the email is registered, you will receive instructions to reset your password. The link is valid for 30 minutes.`;
    }

    async validateToken(token: string){
        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
                issuer: 'dnc_hotel',
                audience: 'users'
            });
            return { valid: true, decoded };
        } catch (e) {
            return { valid: false, message: e.message };
        }
    }
}