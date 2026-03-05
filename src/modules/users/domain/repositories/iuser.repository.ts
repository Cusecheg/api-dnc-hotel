import { Prisma, User } from '@prisma/client';

export interface IUserRepository {
    create(data: any): Promise<User>;
    list(): Promise<User[]>;
    show(id: number): Promise<Prisma.UserGetPayload<{
         select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true }
    }> | null>;

    update(id: number, data: any): Promise<User>;
    delete(id: number): Promise<User>;
    uploadAvatar(id: number, avatarFileName: string): Promise<User>;
}