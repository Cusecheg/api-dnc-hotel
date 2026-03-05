import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDTO } from '../domain/dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { userSelectFields } from '../../prisma/utils/userSelectFields';

@Injectable()
export class CreateUserService {
    constructor( private readonly prisma: PrismaService) {}
    
    async execute(body: CreateUserDTO): Promise<User> {

        const userExists = await this.prisma.user.findUnique({ where: { email: body.email } });
        if (userExists){
            throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        body.password = hashedPassword;
        return await this.prisma.user.create({data: body, select: userSelectFields});

    }
    
}