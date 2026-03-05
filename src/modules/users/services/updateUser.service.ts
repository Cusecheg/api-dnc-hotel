import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { userSelectFields } from '../../prisma/utils/userSelectFields';
import { ShowUserService } from './showUser.service';
import { UpdateUserDTO } from '../domain/dto/updateUser.dto';

@Injectable()
export class UpdateUserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly showUserService: ShowUserService,
        ) {}
    
    async execute(id: number, body: UpdateUserDTO) {
        await this.showUserService.execute(id);
        return await this.prisma.user.update({where: { id }, data: body, select: userSelectFields})
    }
    
}