import { Injectable } from '@nestjs/common';
import { ShowUserService } from './showUser.service';
import { join, resolve } from "path";
import { stat, unlink } from "fs/promises";
import { UpdateUserService } from './updateUser.service';

@Injectable()
export class UploadAvatarUserService {
    constructor(
        private readonly showUserService: ShowUserService,
        private readonly updateUserService: UpdateUserService,
        ) {}
    
    async execute(id: Number, avatarFileName: string) {
        const user = await this.showUserService.execute(Number(id));
        const directory = resolve(process.cwd(), 'uploads/avatars');

        if (user.avatar) {
            const userAvatarFilePath = join(directory, user.avatar);
        try {
            await stat(userAvatarFilePath);
            await unlink(userAvatarFilePath);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err; // Solo ignora si el archivo no existe
        }
    }
        const userUpdated = await this.updateUserService.execute(Number(id), { avatar: avatarFileName });
        return userUpdated;
    }
    
}