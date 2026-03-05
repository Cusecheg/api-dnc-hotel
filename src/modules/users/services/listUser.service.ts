import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { userSelectFields } from '../../prisma/utils/userSelectFields';

@Injectable()
export class ListUserService {
    constructor( private readonly prisma: PrismaService) {}
    
   async execute() {
        return await this.prisma.user.findMany({
            select: userSelectFields
        });
    }
    
}