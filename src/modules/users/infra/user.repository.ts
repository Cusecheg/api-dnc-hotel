import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { IUserRepository } from '../domain/repositories/iuser.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { userSelectFields } from 'src/modules/prisma/utils/userSelectFields';

@Injectable()
export class UserRepository implements IUserRepository {

    constructor(
        private readonly prisma: PrismaService
    ){}
    // Define los métodos que debe implementar el repositorio de usuarios
    create(data: any): Promise<User>{
        return this.prisma.user.create({ data });
    };
    list(): Promise<User[]>{
        return this.prisma.user.findMany();
    }
    show(id: number): Promise<Prisma.UserGetPayload<{
        select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true }
    }> | null>{
        return this.prisma.user.findUnique({ where: { id },  select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true } });
    };
    update(id: number, data: any): Promise<User>{
        return this.prisma.user.update({ where: { id }, data });
    };
    delete(id: number): Promise<User>{
        return this.prisma.user.delete({ where: { id } });
    };
    uploadAvatar(id: number, avatarFileName: string): Promise<User>{
        return this.prisma.user.update({ where: { id }, data: { avatar: avatarFileName } });
    };

}