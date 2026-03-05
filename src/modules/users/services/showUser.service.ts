import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShowUserService {
    constructor( private readonly prisma: PrismaService) {}

    async execute(id: number){
        const user = await this.prisma.user.findUnique({where: { id }, select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true }});
        if (!user){
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }
}