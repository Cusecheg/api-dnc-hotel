import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class FindByEmailUserService {
    constructor(
        private readonly prisma: PrismaService,
        ) {}
    
    async execute(email: string) {
        return await this.prisma.user.findUnique({ where: { email }});
    }
    
}