import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShowUserService } from './showUser.service';

@Injectable()
export class DeleteUserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly showUserService: ShowUserService,
        ) {}
    
async execute(id: number) {
    await this.showUserService.execute(id);
        return await this.prisma.user.delete({ where: { id } });
    }
    
}